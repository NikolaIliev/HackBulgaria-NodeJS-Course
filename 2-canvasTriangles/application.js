var context = document.getElementById("canvas").getContext("2d");
(function () {
    var colorInput = document.getElementById("color-input"),
        saveButton = document.getElementById("save"),
        loadButton = document.getElementById("load-button"),
        loadSelect = document.getElementById("load-select"),
        clickCount = 0,
        currentPoints = [],
        currentTriangles = [],
        currentSaveName = "";

    function startup() {
        fillLoadOptions();
        setEventListeners();
    }

    function setEventListeners() {
        context.canvas.addEventListener("click", onCanvasClick);
        saveButton.addEventListener("click", onSaveClick);
        loadButton.addEventListener("click", onLoadClick);
    }

    function fillLoadOptions() {
        var saves = JSON.parse(localStorage.getItem("canvas_triangles_saves")) || [],
            option, i;

        loadSelect.innerHTML = "";
        if (saves.length === 0) {
            option = document.createElement("option");
            option.value = "";
            option.innerHTML = "Select a save";
            option.disabled = true;
            option.selected = true;
            option.style.display = "none";
            loadSelect.appendChild(option);
        }

        for (i = 0; i < saves.length; i++) {
            option = document.createElement("option");
            option.value = option.innerHTML = saves[i].name;
            loadSelect.appendChild(option);
            if (saves[i].name === currentSaveName) {
                option.selected = true;
            }
        }
    }

    function onSaveClick() {
        var saves = JSON.parse(localStorage.getItem("canvas_triangles_saves")) || [],
            saveName = prompt(),
            overrideIndex = -1;

        currentSaveName = saveName;

        saves.forEach(function (save, index) {
            if (save.name === saveName) {
                overrideIndex = index;
            }
        });

        if (overrideIndex >= 0) {
            saves[overrideIndex] = {
                name: saveName,
                data: currentTriangles
            }
        } else {
            saves.push({
                name: saveName,
                data: currentTriangles
            })
        }

        localStorage.setItem("canvas_triangles_saves", JSON.stringify(saves));
        fillLoadOptions();
    }

    function onLoadClick() {
        var saves = JSON.parse(localStorage.getItem("canvas_triangles_saves")) || [],
            saveName = loadSelect.value,
            trianglesData = [];

        currentTriangles = [];
        clearCanvas();

        saves.forEach(function (save) {
            if (save.name === saveName) {
                trianglesData = save.data;
            }
        });

        trianglesData.forEach(function (triangleData) {
            currentTriangles.push(new Triangle(triangleData));
            currentTriangles[currentTriangles.length - 1].draw();
        });
    }

    function onCanvasClick(event) {
        var triangle;
        clickCount++;
        currentPoints.push({x: event.clientX, y: event.clientY});
        if (clickCount === 3) {
            if (Triangle.prototype.isViable.apply(null, currentPoints)) {
                triangle = new Triangle({a: currentPoints[0], b: currentPoints[1], c: currentPoints[2], color: colorInput.value});
                triangle.draw();
                currentTriangles.push(triangle);
            }
            clickCount = 0;
            currentPoints = [];
        }
    }

    function clearCanvas() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    return {
        startup: startup
    }
})().startup();