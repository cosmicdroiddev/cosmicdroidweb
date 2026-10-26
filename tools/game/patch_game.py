"""
Changes made to the GDevelop project (leapkill.json) before exporting it for the website.
Run on a COPY of the "frog game" folder:  python3 patch_game.py path/to/leapkill.json
  - X key shoots on desktop (same as the round on-screen button)
  - on screens without touch, the joystick + shoot button are hidden
  - the kermit turn markers ("left"/"right") are hidden
  - two holes in the side walls (hidden before under the phone controls) are filled
  - music uses small mp3 files (make them first with ffmpeg, see README.md)
"""
import json, copy, sys, uuid
path = sys.argv[1]
p = json.load(open(path))
for r in p["resources"]["resources"]:
    if r["file"] == "assets/boss_battle_3_alternate.wav": r["file"] = "assets/boss_battle_3_alternate.mp3"
    if r["file"] == "assets/8-bit_bossfight.mp3": r["file"] = "assets/8-bit_bossfight-128.mp3"
l = [l for l in p["layouts"] if l["name"] == "Game Scene"][0]
ev = l["events"]
i = [k for k, e in enumerate(ev) if any(c["type"]["value"].startswith("ButtonStates") for c in e.get("conditions", []))][0]
k = copy.deepcopy(ev[i]); k["conditions"][0] = {"type": {"value": "KeyFromTextPressed"}, "parameters": ["", "\"x\""]}
ev.insert(i + 1, k)
d = [e for e in ev if any(c["type"]["value"] == "DepartScene" for c in e.get("conditions", []))][0]
d["actions"] += [{"type": {"value": "Cache"}, "parameters": ["left", ""]}, {"type": {"value": "Cache"}, "parameters": ["right", ""]}]
d.setdefault("events", []).append({"type": "BuiltinCommonInstructions::Standard",
    "conditions": [{"type": {"inverted": True, "value": "SystemInfo::HasTouchScreen"}, "parameters": [""]}],
    "actions": [{"type": {"value": "HideLayer"}, "parameters": ["", "\"MobileControls\""]}, {"type": {"value": "Cache"}, "parameters": ["test", ""]}]})
src = [x for x in l["instances"] if x["name"] == "Platform_Ground" and x["x"] == 32 and x["y"] == 544][0]
have = {(x["x"], x["y"]) for x in l["instances"] if x["name"] == "Platform_Ground"}
for x, y in [(96, 544), (1120, 544)]:
    if (x, y) not in have:
        n = copy.deepcopy(src); n["x"], n["y"] = x, y
        if "persistentUuid" in n: n["persistentUuid"] = str(uuid.uuid4())
        l["instances"].append(n)
json.dump(p, open(path, "w"))
print("patched", path)
