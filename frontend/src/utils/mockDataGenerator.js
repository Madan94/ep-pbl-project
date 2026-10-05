/** Local solar telemetry simulation. Newest reading is always first. */
export const initialSummary = {
 total_readings:1460, verified_readings:1448, anomaly_readings:12,
 total_energy_kwh:18.642, total_co2_reduced_kg:18.642*.82, total_carbon_credits:18.642*.82/1000,
 active_nodes:4, system_efficiency:98.7, grid_carbon_factor:.82, status:'ONLINE'
};
function packet(step, timestamp, forceAnomaly=false) {
 const drift=Math.sin(step*.08)*.32;
 const voltage=Number((12.45+drift+Math.sin(step*.4)*.05).toFixed(2));
 const current=Number((1.9+drift*.35+Math.cos(step*.3)*.04).toFixed(2));
 const expected_power=Number((voltage*current).toFixed(2));
 const anomaly=forceAnomaly || step%47===0;
 const power=Number((expected_power*(anomaly?1.82:1)).toFixed(2));
 return {id:1000+step,device_id:`SOLAR_ESP32_00${step%4+1}`,voltage,current,power,expected_power,
 temperature:Number((29.8+drift*.4).toFixed(1)),humidity:Number((58.5-drift*.3).toFixed(1)),irradiance:Math.round(855+drift*55),
 status:anomaly?'ANOMALY':'NORMAL',reason:anomaly?`Reported ${power} W exceeds expected ${expected_power} W by 82%; excluded from carbon accounting.`:'Power consistent with P = V × I. Reading accepted for carbon accounting.',
 confidence:anomaly?.58:.996,timestamp:new Date(timestamp).toISOString()};
}
export function generateSeedData(count=80) {
 const now=Date.now(); const logs=[]; let energy=initialSummary.total_energy_kwh;
 for(let index=0;index<count;index++){
  const reading=packet(count-index,now-index*1500);
  logs.push({...reading,energy_kwh:energy,co2_kg:energy*.82,carbon_credits:energy*.82/1000});
  if(reading.status==='NORMAL')energy-=reading.power/1000*1.5/3600;
 }
 return logs;
}
export function generateNextPacket(previous,forceAnomaly=false) { return packet((previous?.id??1000)-1000+1,Date.now(),forceAnomaly); }

