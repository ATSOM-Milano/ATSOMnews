/**
 * maintenance-mode.js
 * Global script to check for maintenance mode and display an overlay if active.
 */

import { newsApi } from './news-api.js';

async function checkMaintenance() {
    // Skip if we are on the admin page
    if (window.location.pathname.includes('admin.html')) return;

    const status = await newsApi.getMaintenanceStatus();
    
    if (status && status.isMaintenance) {
        showMaintenanceOverlay(status.maintenanceMessage);
    }
}

function showMaintenanceOverlay(message) {
    const overlay = document.createElement('div');
    overlay.id = 'maintenance-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, #1a1a2e 0%, #0f1a3a 100%);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: 'Montserrat', sans-serif;
        text-align: center;
        padding: 2rem;
    `;

    const defaultMsg = "Stiamo effettuando dei lavori di manutenzione per rendere ATSOMnews ancora migliore. Torneremo online il prima possibile!";
    const displayMsg = message || defaultMsg;

    overlay.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 3rem; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 600px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: fadeIn 0.8s ease-out;">
            <img src="atsom.png" alt="ATSOM Logo" style="height: 60px; margin-bottom: 2rem; animation: pulse 3s infinite ease-in-out;">
            <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1.5rem; letter-spacing: -1px;">Al lavoro per voi</h1>
            <p style="font-size: 1.1rem; line-height: 1.6; opacity: 0.9; margin-bottom: 2.5rem;">${displayMsg}</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <div style="width: 8px; height: 8px; background: #FF6B6B; border-radius: 50%; animation: bounce 1s infinite alternate;"></div>
                <div style="width: 8px; height: 8px; background: #FF6B6B; border-radius: 50%; animation: bounce 1s infinite alternate 0.2s;"></div>
                <div style="width: 8px; height: 8px; background: #FF6B6B; border-radius: 50%; animation: bounce 1s infinite alternate 0.4s;"></div>
            </div>
        </div>

        <style>
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pulse { 0% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0.8; transform: scale(1); } }
            @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
            body { overflow: hidden !important; }
        </style>
    `;

    document.body.appendChild(overlay);
}

// Check on load
document.addEventListener('DOMContentLoaded', checkMaintenance);
