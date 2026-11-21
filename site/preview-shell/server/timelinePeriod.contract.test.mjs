import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTimelineResponse, rowsToRecords } from './timelineData.mjs';

// Fully synthetic fixture in the EXACT five-tab workbook schema; no real historical claim.
const LH = ['Layer ID','Visitor Label','Default Visible','Order','Included Topics','Supported Geography','Publication Rule','Research / Map Notes','Layer Status'];
const layers = rowsToRecords([
  LH,
  ['historical_events','Historical Events','TRUE',1,'','','','','Active'],
  ['climate_disasters','Climate & Natural Disasters','FALSE',2,'','','','','Active'],
  ['trade_resources','Trade Routes & Resources','FALSE',3,'','','','','Active'],
]);
const EH = ['Map Event ID','Original Event ID','Start Year','End Year','Region','Country / Polity','Event Type','Record Type','Event Title','Event / Development','System / Context','Causes / Drivers','Consequences / Transition','Key Actors / Entities','Location Name','Latitude','Longitude','Geometry ID / URL','Date Precision','Location Accuracy','Feature Type','Sources','Confidence','Evidence Status','Review Status','Publication Status','Media References','Original Audit Status','Notes','Master Timeline Link','Map Placement Status','Data QA Issues','Public Event Ready','Map Feature Ready','Map Layer ID','Layer Subtype','Linked Map Feature ID'];
const index = new Map(EH.map((h,i)=>[h,i]));
function fixture(id, year, layer) {
  const row = Array(EH.length).fill('');
  const values = {'Map Event ID':id,'Start Year':year,'Region':'Synthetic','Event Type':'Synthetic test','Event Title':'Synthetic title','Event / Development':'Synthetic fixture only','Sources':'S1','Confidence':'HIGH','Date Precision':'Exact year','Location Accuracy':'Unknown','Feature Type':'Context only','Evidence Status':'Fully checked','Review Status':'Reviewed','Publication Status':'Approved','Public Event Ready':'YES','Map Feature Ready':'NO','Map Placement Status':'Not applicable','Map Layer ID':layer};
  for (const [h,v] of Object.entries(values)) row[index.get(h)] = v;
  return row;
}
const workbook = {
  layers,
  sources:rowsToRecords([['ID','Source / institution','Coverage / use','URL'],['S1','Synthetic citation','Only synthetic fixture','https://example.invalid/synthetic']]),
  events:rowsToRecords([EH,fixture('EV-500',500,'historical_events'),fixture('EV-501',501,'historical_events'),fixture('EV-1200',1200,'trade_resources')]),
  context:[], methodology:[],
};
test('century fallback turns the real period filter into useful chronological categories', () => {
  const all = buildTimelineResponse({ workbook, query:{ from:500,to:2026,layers:'historical_events,trade_resources' }});
  assert.deepEqual(all.events.map(x=>x.period), ['5th century CE','6th century CE','12th century CE']);
  const filtered = buildTimelineResponse({ workbook,query:{from:500,to:2026,layers:'historical_events,trade_resources',period:'6th century ce'} });
  assert.deepEqual(filtered.events.map(x=>x.id), ['EV-501']);
});
test('period fallback preserves independent layers and all-off behavior', () => {
  const onlyResources = buildTimelineResponse({ workbook,query:{layers:'trade_resources',from:500,to:2026} });
  assert.deepEqual(onlyResources.events.map(x=>x.id), ['EV-1200']);
  const none = buildTimelineResponse({ workbook,query:{layers:'',from:500,to:2026} });
  assert.deepEqual(none.events,[]);
  assert.equal(none.status, 'ready'); // approved records exist, but user selected all-off
});
