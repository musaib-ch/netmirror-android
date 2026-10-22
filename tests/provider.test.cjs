const test = require('node:test');
const assert = require('node:assert/strict');
const {NetMirrorProvider,normalizeSources,normalizeEpisodes,normalizeTitles} = require('../.testbuild/netmirrorProvider.js');
test('extracts nested playback URLs and request headers',()=>{
 const out=normalizeSources({servers:[{name:'Primary',headers:{Referer:'https://example.org/'},sources:[{file:'https://cdn.example.org/live/master.m3u8?token=redacted'}]}]});
 assert.equal(out[0].kind,'hls');assert.equal(out[0].headers.Referer,'https://example.org/');
});
test('rejects non media URL fields and embedded credentials',()=>{
 assert.deepEqual(normalizeSources({poster:'https://images.example.org/a.jpg',source:'https://u:p@evil.example/video.m3u8'}),[]);
});
test('catalog and episode normalization',()=>{
 assert.equal(normalizeTitles({data:[{id:123,title:'Film'}]})[0].id,'123');
 assert.equal(normalizeEpisodes({episodes:[{episode_id:9,episode_name:'Pilot'}]})[0].title,'Pilot');
});
test('rejects insecure and credentialed backend origins',()=>{
 assert.throws(()=>new NetMirrorProvider('http://example.com'));
 assert.throws(()=>new NetMirrorProvider('https://user:pass@example.com'));
});
test('requests expected search route',async()=>{
 const old=global.fetch;let called;
 global.fetch=async(url)=>{called=url;return {ok:true,headers:{get:()=> 'application/json'},text:async()=>'{"data":[{"id":7,"title":"Found"}]}'}};
 try{const rows=await new NetMirrorProvider('https://api.example.org').search('find me');assert.equal(rows[0].title,'Found');assert.equal(new URL(called).pathname,'/newtv/search.php');assert.equal(new URL(called).searchParams.get('s'),'find me');}finally{global.fetch=old;}
});
