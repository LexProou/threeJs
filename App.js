
import * as THREE from "https://cdn.skypack.dev/three@0.128.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, raycaster, mouse, model;
let modelProperties = { diameter: `80`, pressure: `10,0`  };

function init() {
  // Создание сцены
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('3d-canvas'), alpha: true });
  renderer.setSize(1440, 530);

  
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Добавление освещения
  const light = new THREE.AmbientLight(0x404040, 2); // мягкий свет
  scene.add(light);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);

  // Управление камерой 
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true; 
  controls.enablePan = true; 
  controls.enableRotate = true; 

  camera.position.z = 5;

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('dblclick', onMouseDoubleClick, false);

  addDragFunctionality();
}

// Изменения размера окна
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Загрузка 3D модели
function loadModel(url) {
  const loader = new GLTFLoader();
  loader.load(
    url,
    function (gltf) {
      model = gltf.scene; 
      model.scale.set(2, 2, 2);
      model.traverse((child) => {
        if (child.isMesh) {
          if (child.name === 'Circle003') {
            child.userData.isTopPart = true;
          }
        }
      });
      scene.add(model);
      animate();
    },
    undefined,
    function (error) {
      console.error('Ошибка при загрузке модели:', error);
    }
  );
}

// Анимация сцены
function animate() {
  requestAnimationFrame(animate);
  controls.update(); 
  renderer.render(scene, camera);
}

// Двойной клик мыши
function onMouseDoubleClick(event) {
  if (!model) {
    console.error("Модель не загружена.");
    return;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length > 0) {
    const intersect = intersects[0]; 
    const position = intersect.point; 

    // Обновляем координаты модели в модальном окне
    document.getElementById('coord-x').textContent = position.x.toFixed(2);
    document.getElementById('coord-y').textContent = position.y.toFixed(2);
    document.getElementById('coord-z').textContent = position.z.toFixed(2);

    openModal();
  } else {
    console.log("Пересечение не найдено.");
  }
}

// Открытие модального окна
function openModal() {
  const modal = document.getElementById('modal');
  const modelInfo = document.getElementById('model-info');
  
  modelInfo.textContent = 'Кран шаровой с пневмоприводом фланцевый';

  document.getElementById('diameter').textContent = modelProperties.diameter;
  document.getElementById('pressure').textContent = modelProperties.pressure;

  modal.style.display = 'block';
}

// Закрытие модального окна
document.getElementById('close-btn').addEventListener('click', function() {
  document.getElementById('modal').style.display = 'none';
});

// Загрузка файла
document.getElementById('header-container').addEventListener('click', function() {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.glb')) {
    const url = URL.createObjectURL(file);
    loadModel(url); 
  } else {
    alert('Пожалуйста, выберите файл формата .glb');
  }
});

// Смена материала модели
document.getElementById('change-material-btn').addEventListener('click', function() {
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        if (child.name === 'Circle003') {
          console.log('Меняется материал для:', child.name);
          
          if (!child.userData.originalColor) {
            child.userData.originalColor = child.material.color.clone();
          }

          if (child.material.color.equals(new THREE.Color(0x0000ff))) {
            child.material.color.copy(child.userData.originalColor);
          } else {
            child.material.color.set(0x0000ff);
          }
        }
      }
    });
  }
});

// Добавление функциональности для кнопок показа/скрытия свойств и координат
document.getElementById('show-properties-btn').addEventListener('click', function() {
  const properties = document.getElementById('model-properties');
  if (properties.style.display === 'none') {
    properties.style.display = 'block';
    properties.style.opacity = 1;
  } else {
    properties.style.display = 'none';
    properties.style.opacity = 0;
  }
});

document.getElementById('show-coordinates-btn').addEventListener('click', function() {
  const coordinates = document.getElementById('model-coordinates');
  if (coordinates.style.display === 'none') {
    coordinates.style.display = 'block';
    coordinates.style.opacity = 1;
  } else {
    coordinates.style.display = 'none';
    coordinates.style.opacity = 0;
  }
});

// Перемещение модального окна
function addDragFunctionality() {
  const modal = document.getElementById('modal');
  let isDragging = false;
  let offsetX, offsetY;

  modal.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - modal.offsetLeft;
    offsetY = e.clientY - modal.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      modal.style.left = `${e.clientX - offsetX}px`;
      modal.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

init();
