// ===============================
// ARCHITIES 2026 SCANNER
// app.js
// ===============================


const API_URL =
"https://script.google.com/macros/s/AKfycbxlI804_LOtx0DBdYUuVa06jZ0yQXPbRHdGoPrUSodhIgrTq9Hch6D7lVHeW4grv1GZ/exec";


const API_KEY =
"ARCHITIES2026";


const PIN =
"2026ARCH";



let html5QrCode;

let scanAktif = true;

let flashAktif = false;

let audioCtx;

let lastHadir = 0;
let lastTotal = 0;




// ===============================
// LOGIN
// ===============================


function login(){


const pin =
document.getElementById("pin").value;



if(pin !== PIN){

alert("PIN salah");

return;

}



document.getElementById("loginBox")
.style.display="none";


document.getElementById("scannerBox")
.style.display="block";


setTimeout(()=>{

mulaiScanner();

},500);


}









// ===============================
// START SCANNER
// ===============================


async function mulaiScanner(){

try{


html5QrCode =
new Html5Qrcode("reader");



const config = {

fps:10,

qrbox:{
width:250,
height:250
}

};



await html5QrCode.start(

{
facingMode:"environment"
},

config,

onScanSuccess,

(errorMessage)=>{

}

);



loadDashboard();



}

catch(err){

console.error(
"Scanner Error:",
err
);


alert(
"Kamera gagal dibuka\n\n"+err.message
);


}

}


// ===============================
// FLASH
// ===============================


async function aktifkanFlash(){


try{


if(!html5QrCode)
return;



const capabilities =
html5QrCode
.getRunningTrackCapabilities();



if(!capabilities.torch){

alert(
"Flash tidak tersedia"
);

return;

}



flashAktif = !flashAktif;

const btn = document.getElementById("flash");

await html5QrCode
.applyVideoConstraints({

advanced:[
{
torch:flashAktif
}
]

});

if(flashAktif){

    btn.innerHTML = "💡 Flash ON";
    btn.classList.add("flash-on");

}else{

    btn.innerHTML = "🔦 Flash OFF";
    btn.classList.remove("flash-on");

}

}

catch(err){

console.log(err);

}


}










// ===============================
// SCAN SUCCESS
// ===============================


async function onScanSuccess(decodedText){



if(!scanAktif)
return;



scanAktif=false;



const status =
document.getElementById("status");



status.className="waiting";

status.innerHTML=
"⏳ Memverifikasi QR Code...";





try{


const response =
await fetch(

API_URL +

"?action=checkin&id=" +

encodeURIComponent(decodedText)

);



const res =
await response.json();



tampilkanStatus(res);



await loadDashboard();


}

catch(err){


console.error(err);


status.className="error";

status.innerHTML=
"❌ Server Error";


}





setTimeout(()=>{


scanAktif=true;


status.className="waiting";
status.classList.remove("pop");

status.innerHTML=
"📷 Arahkan pada QR Code";


},2500);



}










// ===============================
// STATUS
// ===============================


function tampilkanStatus(res){



const status =
document.getElementById("status");



if(res.success){



beepSuccess();



status.className=
"success pop";


status.innerHTML=
"✅ Check-in Berhasil<br><small>"+res.nama+"</small>";



document.getElementById(
"scannerLast"
).innerHTML=
res.nama;



if(navigator.vibrate){

navigator.vibrate(150);

}



}



else{


beepError();


status.className=
"error pop";



if(res.type==="duplicate"){

status.innerHTML=
"⚠️ Peserta Sudah Check-in";


}

else{


status.innerHTML=
"❌ QR Code Tidak Terdaftar";


}



if(navigator.vibrate){

navigator.vibrate(
[100,80,100]
);

}


}


}










// ===============================
// DASHBOARD MINI
// ===============================


async function loadDashboard(){



try{


const res =
await fetch(
API_URL+"?action=dashboard"
);



const data =
await res.json();




const hadirEl =
document.getElementById("scannerHadir");

const totalEl =
document.getElementById("scannerTotal");

if(data.hadir != lastHadir){

    hadirEl.classList.remove("count-pop");

    void hadirEl.offsetWidth;

    hadirEl.classList.add("count-pop");

}

if(data.total != lastTotal){

    totalEl.classList.remove("count-pop");

    void totalEl.offsetWidth;

    totalEl.classList.add("count-pop");

}

hadirEl.innerHTML = data.hadir;

totalEl.innerHTML = data.total;

lastHadir = data.hadir;

lastTotal = data.total;





const persen =
data.total>0

?

Math.round(
data.hadir*100/data.total
)

:

0;




document.getElementById(
"scannerProgressBar"
)
.style.width=
persen+"%";




document.getElementById(
"scannerPersen"
)
.innerHTML=
persen+"%";



}



catch(err){

console.log(err);

}



}









// ===============================
// SOUND
// ===============================


function getAudio(){


if(!audioCtx){

audioCtx =
new (
window.AudioContext ||
window.webkitAudioContext
)();

}


return audioCtx;


}







function beepSuccess(){


const ctx=getAudio();


if(ctx.state==="suspended")
ctx.resume();



const osc =
ctx.createOscillator();


const gain =
ctx.createGain();



osc.connect(gain);

gain.connect(
ctx.destination
);



osc.frequency.value=900;

osc.type="sine";



gain.gain.value=.3;



osc.start();



gain.gain.exponentialRampToValueAtTime(

0.00001,

ctx.currentTime+.15

);



osc.stop(
ctx.currentTime+.15
);


}







function beepError(){


const ctx=getAudio();


if(ctx.state==="suspended")
ctx.resume();



const osc =
ctx.createOscillator();


const gain =
ctx.createGain();



osc.connect(gain);

gain.connect(
ctx.destination
);



osc.frequency.value=250;

osc.type="square";



gain.gain.value=.3;



osc.start();



gain.gain.exponentialRampToValueAtTime(

0.00001,

ctx.currentTime+.3

);



osc.stop(
ctx.currentTime+.3
);



}
