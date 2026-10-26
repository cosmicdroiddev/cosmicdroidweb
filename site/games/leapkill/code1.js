gdjs.MenuCode = {};
gdjs.MenuCode.localVariables = [];
gdjs.MenuCode.idToCallbackMap = new Map();
gdjs.MenuCode.GDgame_9595titleObjects1= [];
gdjs.MenuCode.GDgame_9595titleObjects2= [];
gdjs.MenuCode.GDNewTextObjects1= [];
gdjs.MenuCode.GDNewTextObjects2= [];
gdjs.MenuCode.GDNewSpriteObjects1= [];
gdjs.MenuCode.GDNewSpriteObjects2= [];
gdjs.MenuCode.GDplayerImageObjects1= [];
gdjs.MenuCode.GDplayerImageObjects2= [];
gdjs.MenuCode.GDNewText2Objects1= [];
gdjs.MenuCode.GDNewText2Objects2= [];
gdjs.MenuCode.GDNewText3Objects1= [];
gdjs.MenuCode.GDNewText3Objects2= [];


gdjs.MenuCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("NewSprite"), gdjs.MenuCode.GDNewSpriteObjects1);
gdjs.copyArray(runtimeScene.getObjects("NewText"), gdjs.MenuCode.GDNewTextObjects1);
gdjs.copyArray(runtimeScene.getObjects("playerImage"), gdjs.MenuCode.GDplayerImageObjects1);
{for(var i = 0, len = gdjs.MenuCode.GDNewTextObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewTextObjects1[i].getBehavior("Tween").addObjectScaleTween3("TapToPlayText", 1.05, "easeInOutSine", 2, false, true);
}
}
{for(var i = 0, len = gdjs.MenuCode.GDNewTextObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewTextObjects1[i].returnVariable(gdjs.MenuCode.GDNewTextObjects1[i].getVariables().getFromIndex(0)).setBoolean(false);
}
}
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "assets/boss_battle_3_alternate.wav", 2, false, 30, 1);
}
{for(var i = 0, len = gdjs.MenuCode.GDNewSpriteObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewSpriteObjects1[i].getBehavior("Opacity").setOpacity(0);
}
}
{for(var i = 0, len = gdjs.MenuCode.GDplayerImageObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDplayerImageObjects1[i].getBehavior("Animation").setAnimationName("idle");
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("NewText"), gdjs.MenuCode.GDNewTextObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDNewTextObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDNewTextObjects1[i].getVariableBoolean(gdjs.MenuCode.GDNewTextObjects1[i].getVariables().getFromIndex(0), false, false) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDNewTextObjects1[k] = gdjs.MenuCode.GDNewTextObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDNewTextObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDNewTextObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDNewTextObjects1[i].getBehavior("Tween").hasFinished("TapToPlayText") ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDNewTextObjects1[k] = gdjs.MenuCode.GDNewTextObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDNewTextObjects1.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.MenuCode.GDNewTextObjects1 */
{for(var i = 0, len = gdjs.MenuCode.GDNewTextObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewTextObjects1[i].getBehavior("Tween").addObjectScaleTween3("TapToPlayText", 1.0, "easeInOutSine", 2, false, true);
}
}
{for(var i = 0, len = gdjs.MenuCode.GDNewTextObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewTextObjects1[i].returnVariable(gdjs.MenuCode.GDNewTextObjects1[i].getVariables().getFromIndex(0)).setBoolean(true);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("NewText"), gdjs.MenuCode.GDNewTextObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDNewTextObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDNewTextObjects1[i].getVariableBoolean(gdjs.MenuCode.GDNewTextObjects1[i].getVariables().getFromIndex(0), true, false) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDNewTextObjects1[k] = gdjs.MenuCode.GDNewTextObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDNewTextObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDNewTextObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDNewTextObjects1[i].getBehavior("Tween").hasFinished("TapToPlayText") ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDNewTextObjects1[k] = gdjs.MenuCode.GDNewTextObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDNewTextObjects1.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.MenuCode.GDNewTextObjects1 */
{for(var i = 0, len = gdjs.MenuCode.GDNewTextObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewTextObjects1[i].getBehavior("Tween").addObjectScaleTween3("TapToPlayText", 1.05, "easeInOutSine", 2, false, true);
}
}
{for(var i = 0, len = gdjs.MenuCode.GDNewTextObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewTextObjects1[i].returnVariable(gdjs.MenuCode.GDNewTextObjects1[i].getVariables().getFromIndex(0)).setBoolean(false);
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(15023316);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("NewSprite"), gdjs.MenuCode.GDNewSpriteObjects1);
{gdjs.evtTools.sound.stopSoundOnChannel(runtimeScene, 2);
}
{for(var i = 0, len = gdjs.MenuCode.GDNewSpriteObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDNewSpriteObjects1[i].getBehavior("Tween").addObjectOpacityTween2("fadein", 255, "linear", 1.5, false);
}
}
{gdjs.evtTools.sound.playSound(runtimeScene, "startgamesound", false, 100, 1);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("NewSprite"), gdjs.MenuCode.GDNewSpriteObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDNewSpriteObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDNewSpriteObjects1[i].getBehavior("Tween").hasFinished("fadein") ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDNewSpriteObjects1[k] = gdjs.MenuCode.GDNewSpriteObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDNewSpriteObjects1.length = k;
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Game Scene", false);
}
}

}


};

gdjs.MenuCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.MenuCode.GDgame_9595titleObjects1.length = 0;
gdjs.MenuCode.GDgame_9595titleObjects2.length = 0;
gdjs.MenuCode.GDNewTextObjects1.length = 0;
gdjs.MenuCode.GDNewTextObjects2.length = 0;
gdjs.MenuCode.GDNewSpriteObjects1.length = 0;
gdjs.MenuCode.GDNewSpriteObjects2.length = 0;
gdjs.MenuCode.GDplayerImageObjects1.length = 0;
gdjs.MenuCode.GDplayerImageObjects2.length = 0;
gdjs.MenuCode.GDNewText2Objects1.length = 0;
gdjs.MenuCode.GDNewText2Objects2.length = 0;
gdjs.MenuCode.GDNewText3Objects1.length = 0;
gdjs.MenuCode.GDNewText3Objects2.length = 0;

gdjs.MenuCode.eventsList0(runtimeScene);
gdjs.MenuCode.GDgame_9595titleObjects1.length = 0;
gdjs.MenuCode.GDgame_9595titleObjects2.length = 0;
gdjs.MenuCode.GDNewTextObjects1.length = 0;
gdjs.MenuCode.GDNewTextObjects2.length = 0;
gdjs.MenuCode.GDNewSpriteObjects1.length = 0;
gdjs.MenuCode.GDNewSpriteObjects2.length = 0;
gdjs.MenuCode.GDplayerImageObjects1.length = 0;
gdjs.MenuCode.GDplayerImageObjects2.length = 0;
gdjs.MenuCode.GDNewText2Objects1.length = 0;
gdjs.MenuCode.GDNewText2Objects2.length = 0;
gdjs.MenuCode.GDNewText3Objects1.length = 0;
gdjs.MenuCode.GDNewText3Objects2.length = 0;


return;

}

gdjs['MenuCode'] = gdjs.MenuCode;
