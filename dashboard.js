const API_URL =
"https://script.google.com/macros/s/AKfycbxlI804_LOtx0DBdYUuVa06jZ0yQXPbRHdGoPrUSodhIgrTq9Hch6D7lVHeW4grv1GZ/exec";

let lastToastId = "";
let lastAttendanceIds = [];

async function loadDashboard(){

    try{
        
    const res = await fetch(
        API_URL + "?action=dashboard"
    );

    const data = await res.json();

    document.getElementById("total").innerHTML =
        data.total;

    document.getElementById("hadir").innerHTML =
        data.hadir;

    document.getElementById("belum").innerHTML =
        data.belum;

    const persen =
        data.total > 0
        ? Math.round(data.hadir * 100 / data.total)
        : 0;

    document.getElementById("persen").innerHTML =
        persen + "%";

    document.getElementById("progressBar").style.width =
        persen + "%";

}catch(err){

    console.error("Dashboard Error:", err);
    }
}
async function loadAttendance(){

    try{

        const res = await fetch(
            API_URL + "?action=attendance"
        );

        const data = await res.json();

        const tbody =
            document.getElementById("attendanceBody");

        const search = document.getElementById("search");

        const keyword = search
            ? search.value.toLowerCase()
            : "";

        tbody.innerHTML = "";

        const hasil = data.filter(p =>

            p.nama.toLowerCase().includes(keyword) ||

            p.id.toLowerCase().includes(keyword)

        );

        if(hasil.length == 0){

            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Tidak ada peserta ditemukan
                    </td>
                </tr>
            `;

            return;
        }

        hasil.reverse();

        updateActivityFeed(hasil);

        hasil.forEach((p,index)=>{

    const isNew = !lastAttendanceIds.includes(p.id);

    tbody.innerHTML += `
        <tr
            data-id="${p.id}"
            class="${isNew ? "new-row" : ""}">

            <td>${index+1}</td>

            <td>${p.id}</td>

            <td>${p.nama}</td>

            <td>${formatTanggalJam(p.waktu)}</td>

        </tr>
    `;

    if(isNew && lastAttendanceIds.length > 0 && lastToastId !== p.id){

    lastToastId = p.id;

    showToast(p.nama,p.waktu);

}

});
    
    lastAttendanceIds = hasil.map(p => p.id);

    }catch(err){

        console.error(err);

    }

}

function formatTanggalJam(waktu){

    if(!waktu){
        return "-";
    }

    const bagian = waktu.split(" ");

    return `
        <div class="tanggal">${bagian[0]}</div>
        <div class="jam">${bagian[1]}</div>
    `;

}

function showToast(nama,waktu){

    const toast = document.getElementById("toast");

    toast.innerHTML = `
        <strong>✅ Check-in Berhasil</strong><br>
        ${nama}<br>
        <small>${waktu}</small>
    `;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

function updateActivityFeed(data){

    const feed = document.getElementById("activityFeed");

    feed.innerHTML = "";

    const terbaru = data.slice(0,5);
    
    terbaru.forEach(p=>{

        feed.innerHTML += `
            <div class="activity-item">

                <div class="activity-name">

                    🟢 ${p.nama}

                </div>

                <div class="activity-time">

                    ${p.waktu}

                </div>

            </div>
        `;

    });

}

loadDashboard();
loadAttendance();

setInterval(()=>{

    loadDashboard();
    loadAttendance();

},5000);

document
.getElementById("search")
.addEventListener("input",loadAttendance);
