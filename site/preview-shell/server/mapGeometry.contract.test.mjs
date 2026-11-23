import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMapLayers, parseTimelineRows } from './timelineData.mjs';

// Synthetic rows use the exact 9-column Map Layers and 37-column Map Events schema.
const headers = [
  'Map Event ID','Original Event ID','Start Year','End Year','Region','Country / Polity',
  'Event Type','Record Type','Event Title','Event / Development','System / Context',
  'Causes / Drivers','Consequences / Transition','Key Actors / Entities','Location Name',
  'Latitude','Longitude','Geometry ID / URL','Date Precision','Location Accuracy',
  'Feature Type','Sources','Confidence','Evidence Status','Review Status',
  'Publication Status','Media References','Original Audit Status','Notes',
  'Master Timeline Link','Map Placement Status','Data QA Issues','Public Event Ready',
  'Map Feature Ready','Map Layer ID','Layer Subtype','Linked Map Feature ID',
];
const layerRows = [
  ['Layer ID','Visitor Label','Default Visible','Order','Included Topics','Supported Geography','Publication Rule','Research / Map Notes','Layer Status'],
  ['historical_events','Historical Events','TRUE',1,'Historical events','Points and geography','Approved only','','Active'],
  ['climate_disasters','Climate & Natural Disasters','FALSE',2,'Drought and disaster','Areas','Approved only','','Active'],
  ['trade_resources','Trade Routes & Resources','FALSE',3,'Trade and extraction','Routes and points','Approved only','','Active'],
];
const sources = [['ID','Source / institution','Coverage / use','URL'],['S1','Synthetic source','Fixture only','https://example.org/s1']];
const poly = JSON.stringify({type:'Polygon',coordinates:[[[-8,32],[-6,32],[-6,35],[-8,32]]]});
const line = JSON.stringify({type:'LineString',coordinates:[[0,0],[1,2]]});
const degenerate = JSON.stringify({type:'LineString',coordinates:[[0,0],[0,0]]});
const index = new Map(headers.map((h,i)=>[h,i]));
const row = (overrides={}) => {
  const value = {
    'Map Event ID':'SYNTH-1400-001','Start Year':1400,'Region':'Morocco',
    'Event Title':'Synthetic route/site/disaster','Event / Development':'Synthetic historical record for schema testing',
    'Date Precision':'Exact year','Location Accuracy':'Exact','Feature Type':'Route',
    'Geometry ID / URL':line,'Sources':'S1','Confidence':'HIGH',
    'Evidence Status':'Fully checked','Review Status':'Reviewed','Publication Status':'Approved',
    'Map Placement Status':'Ready','Public Event Ready':'YES','Map Feature Ready':'YES',
    'Map Layer ID':'trade_resources',...overrides,
  };
  const out=new Array(headers.length).fill('');
  for(const [key,v] of Object.entries(value)) {
    assert.ok(index.has(key),`Unrecognized synthetic column ${key}`);
    out[index.get(key)]=v;
  }
  return out;
};
function parse(rows, preview=false) {
  return parseTimelineRows([headers,...rows],{ preview,sources,layers:parseMapLayers(layerRows,{preview}) });
}

test('route layer admits documented line, not polygon disguised as a trade route',()=>{
  const result=parse([
    row({'Map Event ID':'ROUTE-LINE'}),
    row({'Map Event ID':'ROUTE-POLYGON','Geometry ID / URL':poly}),
    row({'Map Event ID':'ROUTE-DEGENERATE','Geometry ID / URL':degenerate}),
  ]);
  assert.equal(result.length,3);
  assert.equal(result[0].geometry.type,'LineString');
  assert.equal(result[1].geometry,undefined);
  assert.equal(result[2].geometry,undefined);
  assert.equal(result[1].locationPrecision,'none');
});

test('climate impact area accepts real polygon but not line',()=>{
  const result=parse([
    row({'Map Event ID':'AREA-POLY','Map Layer ID':'climate_disasters','Feature Type':'Area','Geometry ID / URL':poly}),
    row({'Map Event ID':'AREA-LINE','Map Layer ID':'climate_disasters','Feature Type':'Area','Geometry ID / URL':line}),
  ]);
  assert.equal(result.length,2);
  assert.equal(result[0].geometry.type,'Polygon');
  assert.equal(result[1].geometry,undefined);
});

test('remote route URL is metadata, never fetched or assumed source geometry',()=>{
  const result=parse([row({'Geometry ID / URL':'https://example.org/route.geojson'})]);
  assert.equal(result[0].geometry,undefined);
});

test('publication and geography gates still suppress unreviewed locations',()=>{
  const result=parse([
    row({'Map Event ID':'NO-MAP-READY','Map Feature Ready':'NO'}),
    row({'Map Event ID':'NOT-EXACT','Location Accuracy':'Disputed'}),
    row({'Map Event ID':'DRAFT','Publication Status':'Draft'}),
  ]);
  assert.equal(result.length,2);
  assert.ok(result.every(x=>x.geometry===undefined));
});
