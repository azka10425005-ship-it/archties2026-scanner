const API_URL =
"https://script.google.com/macros/s/AKfycbxlI804_LOtx0DBdYUuVa06jZ0yQXPbRHdGoPrUSodhIgrTq9Hch6D7lVHeW4grv1GZ/exec";


let lastAttendanceIds = [];

let firstLoad = true;

let toastTimeout;



async function loadDashboard(){


try{


const res = await fetch(
API_URL + "?action=dashboard"
);


const data = await res.json();


document.getElementById("total").textContent =
data.total;



document.getElementById("hadir").textContent =
data.hadir;



document.getElementById("belum").textContent =
data.belum;



const persen =
data.total > 0
?
Math.round(
data.hadir * 100 / data.total
)
:
0;



document.getElementById("persen").textContent =
persen+"%";



document.getElementById("progressBar")
.style.width =
persen+"%";



}

catch(err){

console.error(
"Dashboard Error:",
err
);

}


}






async function loadAttendance(){


try{


const res = await fetch(
API_URL+"?action=attendance"
);



const data = await res.json();
console.log("ATTENDANCE =", data);


const tbody =
document.getElementById(
"attendanceBody"
);



const search =
document.getElementById(
"search"
);



const keyword =
search
?
search.value.toLowerCase()
:
"";




let peserta =
data.filter(p=>{


return (

(p.nama || "")
.toLowerCase()
.includes(keyword)


||

(p.id || "")
.toLowerCase()
.includes(keyword)

);


});






peserta.sort((a,b)=>{

    const parse = (str)=>{

        const [tgl,jam] = str.split(" ");

        const [d,m,y] = tgl.split("/");

        return new Date(
            y,
            m-1,
            d,
            ...jam.split(":")
        );

    };

    return parse(b.waktu) - parse(a.waktu);

});




tbody.innerHTML="";





if(peserta.length===0){


tbody.innerHTML=`

<tr>

<td colspan="4">

Tidak ada peserta ditemukan

</td>

</tr>

`;


return;


}





peserta.forEach((p,index)=>{


const isNew =

!firstLoad &&

!lastAttendanceIds.includes(p.id);





tbody.innerHTML += `


<tr class="${isNew ? "new-row":""}">


<td>
${index+1}
</td>


<td>
${p.id}
</td>


<td>
${p.nama}
</td>


<td>

${formatTanggalJam(p.waktu)}

</td>


</tr>


`;





if(isNew){


showToast(
p.nama,
p.waktu
);


}


});






lastAttendanceIds =
data.map(
p=>p.id
);



firstLoad=false;



updateActivityFeed(
peserta
);



}



catch(err){

console.error(
"Attendance Error:",
err
);

}



}









function formatTanggalJam(waktu){

    if(!waktu){
        return "-";
    }

    // Pisahkan tanggal dan jam
    const [tanggal, jam] = waktu.split(" ");

    // Pisahkan tanggal
    const [hari, bulan, tahun] = tanggal.split("/");

    // Buat objek Date dengan format yang benar
    const date = new Date(
        tahun,
        bulan - 1,
        hari
    );

    return `
        <div class="tanggal">
            ${date.toLocaleDateString("id-ID")}
        </div>

        <div class="jam">
            ${jam}
        </div>
    `;
}









function updateActivityFeed(data){



const feed =
document.getElementById(
"activityFeed"
);



feed.innerHTML="";



data
.slice(0,5)
.forEach(p=>{


feed.innerHTML += `


<div class="activity-item">


<div class="activity-name">

🟢 ${p.nama}

</div>



<div class="activity-time">

${formatTanggalJam(p.waktu)}

</div>


</div>


`;


});


}









function showToast(nama,waktu){



const toast =
document.getElementById(
"toast"
);



toast.innerHTML=`


<strong>
✅ Check-in Berhasil
</strong>

<br>

${nama}

<br>

<small>
${waktu}
</small>


`;



toast.classList.add(
"show"
);



clearTimeout(
toastTimeout
);



toastTimeout=setTimeout(()=>{


toast.classList.remove(
"show"
);


},3000);



}








loadDashboard();

loadAttendance();





setInterval(
loadDashboard,
10000
);



setInterval(
loadAttendance,
5000
);






const searchInput =
document.getElementById(
"search"
);



if(searchInput){


searchInput.addEventListener(
"input",
loadAttendance
);


}
