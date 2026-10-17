import test from 'node:test';
import assert from 'node:assert/strict';
import {randomPick,orderCards,elapsedSeconds,weekLabel,safeParams,validateBackup} from '../logic.js';
test('随机取八项不重复，不足八项不制造重复卡片',()=>{const cards=Array.from({length:12},(_,i)=>({id:i}));const result=randomPick(cards,8,()=>.4);assert.equal(result.length,8);assert.equal(new Set(result.map(c=>c.id)).size,8);assert.equal(cards[0].id,0);assert.equal(randomPick(cards.slice(0,3)).length,3);});
test('取消选中后移回未选区，已选保持置顶',()=>{const cards=[{id:'a',createdAt:3},{id:'b',createdAt:2},{id:'c',createdAt:1}];const selected=new Set(['b','c']);assert.deepEqual(orderCards(cards,selected).map(c=>c.id),['b','c','a']);selected.delete('b');assert.deepEqual(orderCards(cards,selected).map(c=>c.id),['c','a','b']);});
test('暂停时间不会被算进组内有效用时',()=>{assert.equal(elapsedSeconds({elapsed:12,running:false,startedAt:1000},51000),12);assert.equal(elapsedSeconds({elapsed:12,running:true,startedAt:1000},6000),17);});
test('按周一划分本周和上周，跨月仍正确',()=>{const now=new Date(2026,9,10,12);assert.equal(weekLabel(new Date(2026,9,5),now),'本周');assert.equal(weekLabel(new Date(2026,8,30),now),'上周');assert.equal(weekLabel(new Date(2026,9,4),now),'上周');});
test('训练参数有界，组间休息允许零',()=>{assert.deepEqual(safeParams({mode:'reps',target:-1,sets:200,rest:0,pace:500}),{mode:'reps',target:1,sets:99,rest:0,pace:60});});
test('拒绝缺图备份，避免覆盖后出现空卡',()=>{const data={format:'fitness-cardbook',version:1,cards:[{id:'a',imageIds:['missing'],tags:[],name:'',text:'',createdAt:1}],images:[],sessions:[],settings:[]};assert.throws(()=>validateBackup(data),/卡片格式/);assert.throws(()=>validateBackup({}),/不是/);assert.equal(validateBackup({...data,cards:[]}).version,1);});

import {cropPixels} from '../logic.js';
test('裁剪框按原图像素取整，包含反向框选后的区域',()=>{
  assert.deepEqual(cropPixels({left:.25,top:.1,right:.75,bottom:.9},800,1000),{left:200,top:100,width:400,height:800});
  assert.deepEqual(cropPixels({left:0,top:0,right:1,bottom:1},321,123),{left:0,top:0,width:321,height:123});
  assert.deepEqual(cropPixels({left:1,top:1,right:1,bottom:1},321,123),{left:320,top:122,width:1,height:1});
});
