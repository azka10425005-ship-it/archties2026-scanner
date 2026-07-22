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


mulaiScanner();


}









// ===============================
// START SCANNER
// ===============================


async function mulaiScanner(){


try{


html5QrCode =
new Html5Qrcode("reader");



const cameras =
await Html5QrCode.getCameras();



if(!cameras.length){

alert("Kamera tidak ditemukan");

return;

}




const camera =
cameras[cameras.length-1].id;




await html5QrCode.start(

camera,


{

fps:10,

qrbox:{
width:250,
height:250
}

},


onScanSuccess,


()=>{}


);



loadDashboard();


}

catch(err){

console.error(err);

alert(
"Gagal membuka kamera"
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



flashAktif =
!flashAktif;



await html5QrCode
.applyVideoConstraints({

advanced:[
{
torch:flashAktif
}
]

});



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
"Memeriksa...";





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

status.innerHTML=
"Menunggu Scan...";


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
"success";


status.innerHTML=
"✅ "+res.nama;



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
"error";



if(res.type==="duplicate"){

status.innerHTML=
"🔴 Sudah Hadir";


}

else{


status.innerHTML=
"❌ QR Tidak Valid";


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




document.getElementById(
"scannerHadir"
).innerHTML=
data.hadir;



document.getElementById(
"scannerTotal"
).innerHTML=
data.total;





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
