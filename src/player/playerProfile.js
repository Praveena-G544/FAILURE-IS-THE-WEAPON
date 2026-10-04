// PLAYER PROFILE: the shape of everything NEXA remembers about one player (one profile per name).
export const fresh=n=>({name:n,character:0,round:1,highest:1,completed:[],score:0,acc:[],mistakes:0,reaction:[],risk:0,passes:0,eliminated:false,final:null,
 choices:{L:0,C:0,R:0},moves:{L:0,C:0,R:0},seq:[],good:[],bad:[],failures:[],ach:[],hist:[],habits:[],shapeFails:{},errZones:{},rounds:{},sessions:0,intro:false,obs:[],pick:null,routeHist:[],facts:[],
 hiding:{},detections:0,adapt:0,strategies:{good:[],bad:[]}});
