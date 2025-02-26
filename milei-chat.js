// Password Protected Chat Integration for Milei GIF
document.addEventListener('DOMContentLoaded', function() {
    // Reference to the Milei GIF
    const rsiGif = document.getElementById('rsiGif');
    
    // Password for accessing the chat
    const correctPassword = "Uzumaki"; // Change this to your desired password
    
    // Create password modal (hidden by default)
    const passwordModal = document.createElement('div');
    passwordModal.id = 'passwordModal';
    passwordModal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1100;
        align-items: center;
        justify-content: center;
    `;
    
    // Create modal content
    passwordModal.innerHTML = `
        <div style="
            background: #1e1e1e;
            padding: 20px;
            border-radius: 8px;
            width: 300px;
            max-width: 90%;
            border: 1px solid #2a2a2a;
            text-align: center;
        ">
            <h3 style="color: white; margin-top: 0; margin-bottom: 15px;">Enter Password</h3>
            <p style="color: #aaa; margin-bottom: 15px; font-size: 14px;">Please enter the password to access the AI chat</p>
            <input 
                type="password" 
                id="chatPassword" 
                style="
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 15px;
                    border-radius: 4px;
                    border: 1px solid #2a2a2a;
                    background: #333;
                    color: white;
                    box-sizing: border-box;
                "
                placeholder="Password"
            >
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button 
                    id="submitPassword" 
                    style="
                        background: #FF2400;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    "
                >
                    Submit
                </button>
                <button 
                    id="cancelPassword" 
                    style="
                        background: #333;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    "
                >
                    Cancel
                </button>
            </div>
            <p id="passwordError" style="color: #ff4d4d; margin-top: 10px; font-size: 14px; display: none;">
                Incorrect password. Please try again.
            </p>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(passwordModal);
    
    // Initialize chat widget function
    function initializeChatWidget() {
        // Use the actual AgentiveHub chat widget initialization code
        (function(d, t) {
            // Check if script is already loaded
            if (document.querySelector('script[src="https://agentivehub.com/production.bundle.min.js"]')) {
                // If script exists but widget isn't initialized, try to initialize it
                if (window.myChatWidget && typeof window.myChatWidget.load === 'function') {
                    window.myChatWidget.load({
                        id: 'd61a13ab-fb8c-4afc-9567-de35fa98dc24',
                    });
                }
                return;
            }
            
            // Create script element
            var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
            
            // Set up script loading
            v.onload = function() {
                // Create root if needed
                if (!document.getElementById('root')) {
                    var root = d.createElement('div');
                    root.id = 'root';
                    d.body.appendChild(root);
                }
                
                // Initialize widget when script loads
                if (window.myChatWidget && typeof window.myChatWidget.load === 'function') {
                    window.myChatWidget.load({
                        id: 'd61a13ab-fb8c-4afc-9567-de35fa98dc24',
                    });
                } else {
                    // If myChatWidget isn't available immediately, try again shortly
                    setTimeout(function() {
                        if (window.myChatWidget && typeof window.myChatWidget.load === 'function') {
                            window.myChatWidget.load({
                                id: 'd61a13ab-fb8c-4afc-9567-de35fa98dc24',
                            });
                        }
                    }, 500);
                }
            };
            
            // Set script properties and append to document
            v.src = "https://agentivehub.com/production.bundle.min.js";
            v.type = "text/javascript";
            s.parentNode.insertBefore(v, s);
        })(document, 'script');
    }
    
    // Add event handlers for the password modal
    document.getElementById('submitPassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('chatPassword');
        const passwordError = document.getElementById('passwordError');
        
        if (passwordInput.value === correctPassword) {
            // Password correct - initialize chat widget
            passwordModal.style.display = 'none';
            initializeChatWidget();
            
            // Store in session storage to avoid asking again during this session
            sessionStorage.setItem('chatPasswordVerified', 'true');
        } else {
            // Password incorrect - show error
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
    
    document.getElementById('cancelPassword').addEventListener('click', function() {
        passwordModal.style.display = 'none';
    });
    
    // Handle Enter key in password input
    document.getElementById('chatPassword').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('submitPassword').click();
        }
    });
    
    // Close modal when clicking outside
    passwordModal.addEventListener('click', function(event) {
        if (event.target === passwordModal) {
            passwordModal.style.display = 'none';
        }
    });
    
    // Add click handler to the Milei GIF
    if (rsiGif) {
        // Make the GIF look clickable
        rsiGif.style.cursor = 'pointer';
        
        // Add a tooltip
        rsiGif.setAttribute('title', 'Click to chat with Milei AI');
        
        // Add click event to show password prompt
        rsiGif.addEventListener('click', function(event) {
            // Prevent default action if any
            event.preventDefault();
            
            // Add visual feedback
            rsiGif.style.boxShadow = '0 0 10px rgba(255,36,0,0.7)';
            setTimeout(() => {
                rsiGif.style.boxShadow = '';
            }, 300);
            
            // Check if already verified this session
            if (sessionStorage.getItem('chatPasswordVerified') === 'true') {
                initializeChatWidget();
                return;
            }
            
            // Show password modal
            passwordModal.style.display = 'flex';
            document.getElementById('chatPassword').focus();
        });
    }
});