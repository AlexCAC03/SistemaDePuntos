// Configuración de autenticación de Google
const CLIENT_ID = 'TU_CLIENT_ID'; // Reemplaza esto con tu Client ID
const SCOPES = 'profile email';

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(() => {
        // Verificar si el usuario ya está autenticado
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        updateSigninStatus(user.isSignedIn());
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        document.getElementById('pointsDisplay').innerText = points; // Mostrar puntos
    } else {
        // Iniciar sesión si no está autenticado
        gapi.auth2.getAuthInstance().signIn();
    }
}

const rewards = [
    { title: 'Recompensa 1', description: 'Descripción de la recompensa 1.', image: 'icons/RW1.png', points: 100 },
    { title: 'Recompensa 2', description: 'Descripción de la recompensa 2.', image: 'icons/RW2.png', points: 200 },
    // Agrega más recompensas según sea necesario
];

let points = 0; // Suponiendo que comienzas con 0 puntos
const userId = "user"; // Ejemplo de ID de usuario, puedes cambiarlo según necesites

document.getElementById('pointsDisplay').innerText = points;

document.getElementById('goToRedeemPage').onclick = function() {
    document.getElementById('pointsPage').style.display = 'none';
    document.getElementById('redeemPage').style.display = 'block';
    loadRewards();
};

document.getElementById('goToPointsPage').onclick = function() {
    document.getElementById('redeemPage').style.display = 'none';
    document.getElementById('pointsPage').style.display = 'block';
};

document.getElementById('goToRedeemPageFromDetail').onclick = function() {
    document.getElementById('rewardDetailPage').style.display = 'none';
    document.getElementById('redeemPage').style.display = 'block';
};

function loadRewards() {
    const rewardsContainer = document.getElementById('rewardsContainer');
    rewardsContainer.innerHTML = ''; // Limpiar contenedor

    rewards.forEach((reward, index) => {
        const rewardElement = document.createElement('div');
        rewardElement.className = 'reward';
        rewardElement.innerHTML = `
            <img src="${reward.image}" alt="${reward.title}">
            <h3>${reward.title}</h3>
            <p>${reward.points} puntos</p>
            <button onclick="viewRewardDetail(${index})">Canjear</button>
        `;
        rewardsContainer.appendChild(rewardElement);
    });
}

function generateUniqueCode() {
    return 'CODE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function viewRewardDetail(index) {
    const reward = rewards[index];
    document.getElementById('rewardTitle').innerText = reward.title;
    document.getElementById('rewardImage').src = reward.image;
    document.getElementById('rewardDescription').innerText = reward.description;

    document.getElementById('redeemPage').style.display = 'none';
    document.getElementById('rewardDetailPage').style.display = 'block';

    document.getElementById('redeemRewardButton').onclick = function() {
        if (points >= reward.points) {
            points -= reward.points; // Resta los puntos
            const uniqueCode = generateUniqueCode(); // Genera un código único

            document.getElementById('uniqueCode').innerText = uniqueCode; // Muestra el código único
            document.getElementById('rewardDetailPage').style.display = 'none'; // Oculta la página de detalles
            document.getElementById('rewardConfirmation').style.display = 'block'; // Muestra la página de comprobante

            document.getElementById('pointsDisplay').innerText = points; // Actualiza los puntos
        } else {
            alert('No tienes suficientes puntos para canjear esta recompensa.');
        }
    };
}

// Navegar de vuelta a Mis Puntos desde el comprobante
document.getElementById('backToPointsFromConfirmation').onclick = function() {
    document.getElementById('rewardConfirmation').style.display = 'none';
    document.getElementById('pointsPage').style.display = 'block';
};

// Agregar Puntos Manualmente
document.getElementById('addPointsButton').onclick = function() {
    const userIdInput = document.getElementById('userId').value;
    const pointsToAddInput = parseInt(document.getElementById('pointsToAdd').value);

    // Verifica que el ID de usuario sea correcto y que la cantidad de puntos sea válida
    if (userIdInput === userId && !isNaN(pointsToAddInput) && pointsToAddInput > 0) {
        points += pointsToAddInput; // Agrega los puntos
        document.getElementById('pointsDisplay').innerText = points; // Actualiza los puntos
        document.getElementById('addPointsMessage').innerText = `Se han agregado ${pointsToAddInput} puntos al usuario.`;
    } else {
        document.getElementById('addPointsMessage').innerText = 'Error: Verifica el ID del usuario y la cantidad de puntos.';
    }
};

// Navegar de vuelta a Mis Puntos desde la página de agregar puntos
document.getElementById('backToPointsFromDeveloper').onclick = function() {
    document.getElementById('developerPage').style.display = 'none';
    document.getElementById('pointsPage').style.display = 'block';
};

// Cargar la API de Google cuando se carga la página
window.onload = function() {
    handleClientLoad();
};
