

console.log("FindIt JavaScript is working!");

// زر الإبلاغ عن غرض مفقود
const lostButton = document.getElementById("lostButton");

lostButton.addEventListener("click", function() {
    resetReportForm();
    document.getElementById("reportType").value = "lost";
    showSection("reportSection");
});

// زر الإبلاغ عن غرض موجود
const foundButton = document.getElementById("foundButton");

foundButton.addEventListener("click", function() {
    resetReportForm();
    document.getElementById("reportType").value = "found";
    showSection("reportSection");
});


function showSection(sectionId) {
    const sections = document.querySelectorAll("main > section");

    sections.forEach(function(section) {
        section.classList.remove("active-section");
    });

    const selectedSection = document.getElementById(sectionId);


    if (selectedSection) {
        selectedSection.classList.add("active-section");

        if (sectionId === "statsSection") {
            updateStatistics();
        }

        window.scrollTo(0, 0);
    }

}




const reportForm = document.getElementById("reportForm");


reportForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const reportType = document.getElementById("reportType").value;
    const itemName = document.getElementById("itemName").value;
    const itemDescription = document.getElementById("itemDescription").value;
    const itemLocation = document.getElementById("itemLocation").value;
    const itemImage = document.getElementById("itemImage").files[0];

    const saveReport = function(imageData) {
        const reports = JSON.parse(localStorage.getItem("reports")) || [];

        if (editingReportId !== null) {

            const reportIndex = reports.findIndex(function(report) {
                return report.id === editingReportId;
            });

            if (reportIndex === -1) {
                console.error("البلاغ المطلوب تعديله غير موجود");
                return;
            }

            const oldReport = reports[reportIndex];

            reports[reportIndex] = {
                ...oldReport,
                type: reportType,
                name: itemName,
                description: itemDescription,
                location: itemLocation,
                image: imageData !== null ? imageData : oldReport.image
            };

        } else {


            const newReport = {
                id: Date.now(),
                type: reportType,
                name: itemName,
                description: itemDescription,
                location: itemLocation,
                image: imageData,
                status: "active"
            };


            reports.push(newReport);
        }

        try {
            localStorage.setItem("reports", JSON.stringify(reports));

            const wasEditing = editingReportId !== null;

            editingReportId = null;

            document.querySelector(
                "#reportForm button[type='submit']"
            ).textContent = "حفظ البلاغ";

            reportForm.reset();
            displayReports();
            showSection("reportsSection");

            console.log(
                wasEditing
                    ? "تم تعديل البلاغ بنجاح"
                    : "تم إضافة البلاغ بنجاح"
            );

        } catch (error) {
            console.error("تعذر حفظ البيانات:", error);
        }
    };

    if (itemImage) {
        const reader = new FileReader();

        reader.onload = function() {
            saveReport(reader.result);
        };

        reader.onerror = function() {
            console.error("حدث خطأ أثناء قراءة الصورة.");
        };

        reader.readAsDataURL(itemImage);
    } else {
        saveReport(null);
    }
});



const reportsContainer = document.getElementById("reportsContainer");

function displayReports() {

    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput.value.trim().toLowerCase();


    const selectedType = document.getElementById("typeFilter").value;

    const selectedStatus = document.getElementById("statusFilter").value;

    const filteredReports = reports.filter(function(report) {

        const matchesSearch =
            report.name.toLowerCase().includes(searchText) ||
            report.description.toLowerCase().includes(searchText) ||
            report.location.toLowerCase().includes(searchText);


        const matchesType =
            selectedType === "all" || report.type === selectedType;


        const reportStatus = report.status || "active";

        const matchesStatus =
            selectedStatus === "all" || reportStatus === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;

    });


    reportsContainer.innerHTML = "";

    if (filteredReports.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "لا توجد بلاغات تطابق البحث أو الفلترة المحددة.";

        reportsContainer.appendChild(emptyMessage);

        return;
    }

    filteredReports.forEach(function(report) {
        const reportCard = document.createElement("div");
        reportCard.className = "report-card";


        reportCard.addEventListener("click", function() {
            showItemDetails(report.id);
        });

        const reportName = document.createElement("h3");
        reportName.textContent = report.name;

        const reportType = document.createElement("p");
        reportType.textContent = report.type === "lost"
            ? "النوع: مفقود"
            : "النوع: موجود";

        const reportDescription = document.createElement("p");
        reportDescription.textContent = "الوصف: " + report.description;

        const reportLocation = document.createElement("p");
        reportLocation.textContent = "المكان: " + report.location;

        const reportStatus = document.createElement("p");
        reportStatus.className = "card-status";

        if (report.status === "completed") {
            reportStatus.textContent = report.type === "lost"
                ? "تم العثور على الغرض"
                : "تم تسليم الغرض لصاحبه";

            reportStatus.classList.add("completed-status");
        } else {
            reportStatus.textContent = "البلاغ مفتوح";
            reportStatus.classList.add("active-status");
        }

        if (report.image) {
            const reportImage = document.createElement("img");
            reportImage.src = report.image;
            reportImage.alt = report.name;
            reportCard.appendChild(reportImage);
        }

        reportCard.appendChild(reportName);
        reportCard.appendChild(reportType);
        reportCard.appendChild(reportDescription);

        const matches = findMatches(report);

        if (matches.length > 0) {
            const matchMessage = document.createElement("p");

            matchMessage.className = "match-message";

            matchMessage.textContent =
                "يوجد " + matches.length + " بلاغ مشابه محتمل";

            reportCard.appendChild(matchMessage);
        }

        reportCard.appendChild(reportLocation);
        reportCard.appendChild(reportStatus);
        reportsContainer.appendChild(reportCard);
    });
}

displayReports();


const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function() {
    displayReports();
});


const typeFilter = document.getElementById("typeFilter");

typeFilter.addEventListener("change", function() {
    displayReports();
});


const statusFilter = document.getElementById("statusFilter");

statusFilter.addEventListener("change", function() {
    displayReports();
});


function findMatches(report) {
    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const matches = reports.filter(function(otherReport) {

        if (report.id === otherReport.id) {
            return false;
        }

        if (report.type === otherReport.type) {
            return false;
        }

        const name1 = report.name.trim().toLowerCase();
        const name2 = otherReport.name.trim().toLowerCase();

        const location1 = report.location.trim().toLowerCase();
        const location2 = otherReport.location.trim().toLowerCase();

        const similarName =
            name1.length > 0 &&
            name2.length > 0 &&
            (name1.includes(name2) || name2.includes(name1));

        const similarLocation =
            location1.length > 0 &&
            location2.length > 0 &&
            (location1.includes(location2) ||
                location2.includes(location1));

        return similarName && similarLocation;
    });

    return matches;
}


function showItemDetails(reportId) {
    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const report = reports.find(function(item) {
        return item.id === reportId;
    });

    if (!report) {
        return;
    }

    const itemDetails = document.getElementById("itemDetails");

    itemDetails.innerHTML = "";

    if (report.image) {
        const image = document.createElement("img");
        image.src = report.image;
        image.alt = report.name;
        itemDetails.appendChild(image);
    }

    const name = document.createElement("h3");
    name.textContent = report.name;
    itemDetails.appendChild(name);

    const type = document.createElement("p");
    type.textContent = "نوع البلاغ: " +
        (report.type === "lost" ? "مفقود" : "موجود");
    itemDetails.appendChild(type);

    const description = document.createElement("p");
    description.textContent = "الوصف: " + report.description;
    itemDetails.appendChild(description);

    const location = document.createElement("p");
    location.textContent = "المكان: " + report.location;
    itemDetails.appendChild(location);

    const status = document.createElement("p");

    status.className = "report-status";

    if (report.status === "completed") {
        status.textContent = report.type === "lost"
            ? "الحالة: تم العثور على الغرض"
            : "الحالة: تم تسليم الغرض لصاحبه";

        status.classList.add("completed-status");
    } else {
        status.textContent = "الحالة: البلاغ مفتوح";
        status.classList.add("active-status");
    }

    itemDetails.appendChild(status);

    const actionButtons = document.createElement("div");
    actionButtons.className = "action-buttons";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.textContent = "تعديل البلاغ";

    editButton.addEventListener("click", function() {
        editReport(report.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "حذف البلاغ";

    deleteButton.addEventListener("click", function() {
        deleteReport(report.id);
    });

    actionButtons.appendChild(editButton);

    if (report.status !== "completed") {
        const completeButton = document.createElement("button");

        completeButton.type = "button";
        completeButton.className = "complete-btn";

        completeButton.textContent = report.type === "lost"
            ? "تم العثور على الغرض"
            : "تم تسليم الغرض لصاحبه";

        completeButton.addEventListener("click", function() {
            completeReport(report.id);
        });

        actionButtons.appendChild(completeButton);
    }

    actionButtons.appendChild(deleteButton);

    itemDetails.appendChild(actionButtons);

    showSection("detailsSection");
}

function deleteReport(reportId) {
    const confirmDelete = confirm("هل أنت متأكد من حذف هذا البلاغ؟");

    if (!confirmDelete) {
        return;
    }

    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const updatedReports = reports.filter(function(report) {
        return report.id !== reportId;
    });

    try {
        localStorage.setItem("reports", JSON.stringify(updatedReports));

        displayReports();
        showSection("reportsSection");

        console.log("تم حذف البلاغ بنجاح");
    } catch (error) {
        console.error("حدث خطأ أثناء حذف البلاغ:", error);
    }
}

let editingReportId = null;

function editReport(reportId) {
    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const report = reports.find(function(item) {
        return item.id === reportId;
    });

    if (!report) {
        return;
    }

    editingReportId = report.id;

    document.querySelector(
        "#reportForm button[type='submit']"
    ).textContent = "حفظ التعديلات";

    document.getElementById("reportType").value = report.type;
    document.getElementById("itemName").value = report.name;
    document.getElementById("itemDescription").value = report.description;
    document.getElementById("itemLocation").value = report.location;

    showSection("reportSection");
}

function resetReportForm() {
    editingReportId = null;
    reportForm.reset();

    document.querySelector(
        "#reportForm button[type='submit']"
    ).textContent = "حفظ البلاغ";
}

function completeReport(reportId) {
    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const reportIndex = reports.findIndex(function(report) {
        return report.id === reportId;
    });

    if (reportIndex === -1) {
        console.error("البلاغ غير موجود");
        return;
    }

    if (reports[reportIndex].status === "completed") {
        return;
    }

    reports[reportIndex].status = "completed";

    try {
        localStorage.setItem("reports", JSON.stringify(reports));

        displayReports();
        showItemDetails(reportId);

        console.log("تم تحديث حالة البلاغ بنجاح");
    } catch (error) {
        console.error("تعذر تحديث حالة البلاغ:", error);
    }
}

function updateStatistics() {
    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const total = reports.length;

    const lost = reports.filter(function(report) {
        return report.type === "lost";
    }).length;

    const found = reports.filter(function(report) {
        return report.type === "found";
    }).length;

    const completed = reports.filter(function(report) {
        return report.status === "completed";
    }).length;

    document.getElementById("totalReports").textContent = total;
    document.getElementById("lostReports").textContent = lost;
    document.getElementById("foundReports").textContent = found;
    document.getElementById("completedReports").textContent = completed;

    const completionPercentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("completionBar").style.width =
        completionPercentage + "%";

    document.getElementById("completionPercentage").textContent =
        completionPercentage + "%";

}
