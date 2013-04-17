WAAX (Web Audio API eXtension) : [mini-IDE][6]
---------------------------------------------
**JavaScript library for music and audio programming on Chrome**

```javascript
// creating units
var saw = new WX.Oscil({ type:"sawtooth" }),
    sqr = new WX.Oscil({ type:"square" }),
    lpf = new WX.ModLPF({ cutoff:2500, Q:12 }),
    env = new WX.ADSR({ a:0.001, d:0.002, s:0.3, r:0.1 }),
    vrb = new WX.ConVerb({ source:"ir/hall.wav", mix:0.3 });
// building an audiograph
WX.link(saw, lpf, env, vrb, WX.DAC);
// connecting units
sqr.to(lpf);
```

**Table of Contents**

* [Introduction](#indroduction)
* [Demo](#demo)
* [Usages](#usages)
  * [Creating Units](#creating-units)
  * [Making Connections](#making-connections)
  * [Setting Parameters](#setting-parameters)
  * [Visualization](#visualization) 
  * [GUI](#gui)


Introduction
------------

WAAX is an experimental JavaScript library built on top of [Web Audio API][1] in Chrome. With **music creation and performance** in mind, it offers the higher level of functionality than basic building blocks of Web Audio API.

The goal of this project is 1) to facilitate experiments and iterations of web-based audio programming and 2) to hide audio-specific chores from web developers who are not familiar with audio programming.

The facade of API is strongly inspired by [THREE.js][2] and [ChucK][3]: Three.js is one of WebGL JavaScript libraries being used most for web-based 3D graphics. ChucK is an experimental audio programming language being actively developed and used by computer music communities such as [PLOrk][4](Princeton Laptop Orchestra) and [SLOrk][5](Stanford Laptop Orchestra).

As this library is in early stages of development, it currently demonstrates minimum set of features, however, it will embrace more elements as it grows: ready-made instruments, comprehensive timebase system (in conjunction with Web MIDI API), and musical interconnection between multiple Chrome clients.

_NOTE_: As time of writing, [FireFox has recently started implementing Web Audio API][20] and it's partially available in the Nightly Build. Safari also has the implementation of Web Audio API but it is slightly outdated compared to the one in Chrome.)

[1]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API: W3C Editor's Draft"
[2]: https://github.com/mrdoob/three.js/ "THREE.js: Github Repo"
[3]: http://chuck.cs.princeton.edu/
[4]: http://plork.cs.princeton.edu/
[5]: http://slork.stanford.edu/
[20]: https://hacks.mozilla.org/2013/02/webrtc-enabled-h-264mp3-support-in-win-7-on-by-default-metro-ui-for-windows-8-more-firefox-development-highlights/


Demo
----
Requirements: **Google Chrome 20+** on any platform (Win/OSX/Linux). You can check the availability of the API in different web browsers [here](http://caniuse.com/audio-api).

 * **[mini-IDE][6]** (which includes all the examples below)
  * [Hello WAAX][15] 
  * [WAAX does THX][10]
  * [Acidic Bassline][11]
  * [Simple Drum Sampler][12]
  * [Take the I train](http://hoch.github.com/waax/examples/take-i-train.html)
  * [Custom Visualizer][13]
  * [WAAX GUI (pilot)][14]

_Adjust your volume setting before clicking. It might be loud!_

[6]: http://hoch.github.com/waax/examples/editor.html
[10]: http://hoch.github.com/waax/examples/waax-does-thx.html
[11]: http://hoch.github.com/waax/examples/acidic-bassline.html
[12]: http://hoch.github.com/waax/examples/simple-drum-sampler.html
[13]: http://hoch.github.com/waax/examples/take-i-train.html
[14]: http://hoch.github.com/waax/examples/ui-manager.html
[15]: http://hoch.github.com/waax/examples/hello-waax.html


Usages
------

### Creating Units

Like the _node_ in Web Audio API, WAAX has its own atomic object called **unit**. It is conceptually identical to the 'unit generator' of other audio programming environments.

```javascript
// creating a sampler and a compressor units
var kick = new WX.Sampler({ source: "kd.wav", basePitch: 60 }),
    comp = new WX.Comp();
```

A unit can be created with initial parameters, or it can be set with default parameters when created with no argument.


### Making Connections

```javascript
// connecting units with .to() method
kick.to(comp).to(WX.DAC);
// equivalent to the above
WX.link(kick, comp, WX.DAC);
```

As shown above, the connection between several WAAX units can be achieved by chaining `.to()` methods. Alternatively, the `WX.link()` method can be used to build an audiograph out of multiple units. `WX.DAC` is the master output of WAAX system.

```javascript
// native Web Audio API node
var node = myAudioContext.createGain();
// unit => node
kick.connect(node);
// node => unit
node.connect(comp._inlet);
```

The connection from a WAAX unit to Web Audio API node can be done by `.connect()` method, which is the same method in Web Audio API, but the connection from a node to a unit should be done manually with `._inlet` node from a unit. This enables to use the library in conjunction with plain Web Audio API codes.


### Setting Parameters 

_note: this will be changed in the next revision._

```javascript
comp.threshold = -12;
comp.ratio = 8.0;
kick.params = { source:"kd2.wav", basePitch:48 };

console.log(kick.source);
>>> "kd2.wav"
console.log(kick.params);
>>> { source:"kd2.wav", basePitch:48 }
```

All the parameters of a unit is accessible by simply setting or getting values. Alternatively, passing a javascript object literal with parameters into `.params` is also possible. Getting available parameters from a unit can be done by printing out `.params` as well.


### Visualization

```javascript
// creating waveform display with target canvas ID
var wf = new WX.Waveform({ canvas:"CANVAS-ID" });
// connecting compressor unit to waveform visualizer
comp.to(wf);
// draw waveform
wf.draw();
```

Using a set of units called _Analyzers_, visualizing waveforms and spectrum can be achieved instantly. The visual content will be automatically resized according to the size of the target canvas DOM element.


### GUI

```javascript
// div for UI panel
var panel = document.getElementById("wx-uipanel");
// a knob
var ka = new WX.UIKnob({ 
  targetDiv:panel, label:"Attack", 
  x:250, y:485, offset: 0.001, scale: 0.5, value: 0.2
});
// targeting an attack parameter in an ADSR unit
ka.setTargetValue(adsr, "a");
```

The basic GUI interaction is implemented in the current revision (r5): vertical/horizontal slider, and a knob. WAAX units have "modulation targets" that can be controlled by various modulation sources such as GUI components or even other units simply by putting a single line of code.


Units: Generators, Processors and Analyzers
-------------------------------------------
As WAAX is in early stages of development, there are several components (which are yet to be released publicly) to be incorporated into this library in the near future. I am currently expanding its sonic vocabulary by adding more units to the library. The followings are a basic set of units as the first milestone. A detailed documentation for various units will be available soon.

### Generators
`WX.Oscil` `WX.Noise` `WX.Sampler` `WX.LFO` `WX.ImpTrain`

### Processors
`WX.ADSR` `WX.ModLPF` `WX.TwinDelay` `WX.ConVerb` `WX.Comp` `WX.C2`

### Analyzers
`WX.Waveform` `WX.Spectrum` `WX.Visualizer` 

### GUI
`UISliderH` `UISliderV` `UIKnob`

### Utilities
`WX.random2` `WX.random2f` `WX.db2lin` `WX.lin2db` `WX.pitch2freq` `WX.freq2pitch`


Futurework
----------
There are several components (which are yet to be released publicly) to be incorporated into this library in the near future. One of these components is [WebRTC][7], the new web technology that enables a peer-to-peer connection between browsers. It realizes the idea of real time collaboration by interconnecting multiple clients without complicated server-side programming. The other one is [Web MIDI API][8] that empowers the browser to access local MIDI devices (i.e. USB-MIDI keyboards and controllers)

[7]: http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcdatachannel
[8]: http://webaudio.github.com/web-midi-api/


Contact and License
-------------------
This project is initiated and managed by hoch([Hongchan Choi][9]). Please refer LICENSE file (MIT License) for more info.

[9]: https://ccrma.stanford.edu/~hongchan/
