function windowChrome(platform,theme){
 const mac=platform==='darwin',dark=theme==='dark';
 return {
  backgroundColor:mac?(dark?'#202020':'#f5f5f5'):(dark?'#141923':'#f6f7fa'),
  ...(mac?{titleBarStyle:'hiddenInset',trafficLightPosition:{x:14,y:18}}:{})
 };
}
module.exports={windowChrome};
