let protocols = [];
let availablePool = [];
let player1Pool = [];
let player2Pool = [];
let draftType = null;
let selectedSets = new Set();
let currentPlayer = 1; // Tracks the current player (1 or 2)
let selectionsRemaining = 0; // Tracks how many selections the current player must make

// Load protocols.json
fetch('protocols.json')
    .then(response => response.json())
    .then(data => {
        protocols = data;
        initializeSetSelection();
    });

// Initialize set selection
function initializeSetSelection() {
    const setCheckboxes = document.getElementById('set-checkboxes');
    const sets = new Set(protocols.map(p => p.Set));
    sets.forEach(set => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${set}" checked> ${set}`;
        setCheckboxes.appendChild(label);
    });

    // Dynamically display protocols when sets are selected
    document.querySelectorAll('#set-checkboxes input').forEach(input => {
        input.addEventListener('change', () => {
            selectedSets = new Set([...document.querySelectorAll('#set-checkboxes input:checked')].map(input => input.value));
            displayProtocols();
        });
    });

    // Display protocols initially (all sets selected by default)
    displayProtocols();

    // Attach event listener to the dynamically created Confirm Sets button
    document.getElementById('confirm-sets').addEventListener('click', confirmSets);
}

// Confirm sets and proceed to drafting process
function confirmSets() {
    selectedSets = new Set([...document.querySelectorAll('#set-checkboxes input:checked')].map(input => input.value));
    availablePool = protocols.filter(p => selectedSets.has(p.Set));

    // Error checking for minimum protocols
    if ((draftType === 'standard' && availablePool.length < 7) || (draftType === 'blind-elimination' && availablePool.length < 9)) {
        alert(`Not enough protocols in the selected sets. Required: ${draftType === 'standard' ? 7 : 9}`);
        return;
    }

    document.getElementById('set-selection').classList.add('hidden'); // Hide set selection
    document.getElementById('protocol-display').classList.add('hidden'); // Hide protocol display
    document.getElementById('draft-process').classList.remove('hidden'); // Show drafting process
    startDraftProcess(); // Start the drafting process
}

// Event listeners for draft type selection
document.getElementById('standard-draft').addEventListener('click', () => {
    draftType = 'standard';
    document.getElementById('draft-type').classList.add('hidden'); // Hide draft type selection
    document.getElementById('set-selection').classList.remove('hidden'); // Show set selection
    document.getElementById('set-selection').innerHTML = `
        <h3>Standard Draft - Select Sets</h3>
        <div id="set-checkboxes"></div>
        <button id="confirm-sets">Confirm Sets</button>
        <div id="protocol-cards"></div> <!-- Protocol cards will be displayed here -->
    `;
    initializeSetSelection(); // Reinitialize set selection
    selectedSets = new Set(protocols.map(p => p.Set)); // Default to all sets
    displayProtocols(); // Display protocols dynamically
});

document.getElementById('blind-elimination-draft').addEventListener('click', () => {
    draftType = 'blind-elimination';
    document.getElementById('draft-type').classList.add('hidden'); // Hide draft type selection
    document.getElementById('set-selection').classList.remove('hidden'); // Show set selection
    document.getElementById('set-selection').innerHTML = `
        <h3>Blind Elimination Draft - Select Sets</h3>
        <div id="set-checkboxes"></div>
        <button id="confirm-sets">Confirm Sets</button>
        <div id="protocol-cards"></div> <!-- Protocol cards will be displayed here -->
    `;
    initializeSetSelection(); // Reinitialize set selection
    selectedSets = new Set(protocols.map(p => p.Set)); // Default to all sets
    displayProtocols(); // Display protocols dynamically
});

// Display protocols dynamically
function displayProtocols() {
    const protocolCards = document.getElementById('protocol-cards');
    protocolCards.innerHTML = ''; // Clear previous content
    const filteredProtocols = protocols.filter(p => selectedSets.has(p.Set));
    filteredProtocols.forEach(protocol => {
        const card = document.createElement('div');
        card.className = 'protocol-card';
        card.innerHTML = `
            <strong>${protocol.Protocol}</strong><br>
            ${protocol.Top}<br>
            ${protocol.Bottom}<br>
            <em><b>Set: ${protocol.Set}</b></em>
        `;
        protocolCards.appendChild(card);
    });
}

// Start the drafting process
function startDraftProcess() {
    const draftActions = document.getElementById('draft-actions');

    if (draftType === 'standard') {
        standardDraft();
    } else if (draftType === 'blind-elimination') {
        blindEliminationDraft();
    }
}

// Standard Draft logic
function standardDraft() {
    const draftActions = document.getElementById('draft-actions');

    if (currentPlayer === 1) {
        if (player1Pool.length === 0) {
            selectionsRemaining = 1; // Player 1 selects 1 protocol
        } else if (player1Pool.length === 1) {
            selectionsRemaining = 2; // Player 1 selects 2 protocols
        }
    } else if (currentPlayer === 2) {
        if (player2Pool.length === 0) {
            selectionsRemaining = 2; // Player 2 selects 2 protocols
        } else if (player2Pool.length === 2) {
            selectionsRemaining = 1; // Player 2 selects 1 protocol
        }
    }

    draftActions.innerHTML = `<p>Player ${currentPlayer}'s turn. <br>Select ${selectionsRemaining} protocol(s):</p>`;
    // Display available protocols for selection
    availablePool.forEach((protocol, index) => {
        const card = document.createElement('div');
        card.className = 'protocol-card';
        card.innerHTML = `
            <strong>${protocol.Protocol}</strong><br>
            ${protocol.Top}<br>
            ${protocol.Bottom}<br>
            <em><b>Set: ${protocol.Set}</b></em>
        `;

        // Add click event to select the protocol
        card.addEventListener('click', () => {
            if (currentPlayer === 1) {
                player1Pool.push(protocol); // Add to Player 1's pool
            } else {
                player2Pool.push(protocol); // Add to Player 2's pool
            }
            availablePool.splice(index, 1); // Remove from available pool
            selectionsRemaining--;

            // Check if the current player's turn is complete
            if (selectionsRemaining === 0) {
                // Switch players
                currentPlayer = currentPlayer === 1 ? 2 : 1;

                // Check if drafting is complete
                if (player1Pool.length + player2Pool.length === 6) {
                    endDraft();
                } else {
                    standardDraft(); // Continue drafting
                }
            } else {
                standardDraft(); // Continue current player's turn
            }
        });

        draftActions.appendChild(card);
    });
}

// Blind Elimination Draft logic
function blindEliminationDraft() {
    const draftActions = document.getElementById('draft-actions');

    // Randomly eliminate all but 9 protocols
    while (availablePool.length > 9) {
        const randomIndex = Math.floor(Math.random() * availablePool.length);
        availablePool.splice(randomIndex, 1);
    }

    // Prompt Player 1 to eliminate 1 protocol
    if (currentPlayer === 1) {
        draftActions.innerHTML = `<p>Player 1's turn.<br> Select 1 protocol to eliminate:</p>`;
    }
    // Prompt Player 2 to eliminate 1 protocol
    else if (currentPlayer === 2) {
        draftActions.innerHTML = `<p>Player 2's turn.<br> Select 1 protocol to eliminate:</p>`;
    }

    // Display available protocols for elimination
    availablePool.forEach((protocol, index) => {
        const card = document.createElement('div');
        card.className = 'protocol-card';
        card.innerHTML = `
            <strong>${protocol.Protocol}</strong><br>
            ${protocol.Top}<br>
            ${protocol.Bottom}<br>
            <em><b>Set: ${protocol.Set}</b></em>
        `;

        // Add click event to eliminate the protocol
        card.addEventListener('click', () => {
            availablePool.splice(index, 1); // Eliminate the selected protocol
            currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch players

            // Check if elimination phase is complete
            if (availablePool.length === 7) {
                standardDraft(); // Proceed to standard draft
            } else {
                blindEliminationDraft(); // Continue elimination
            }
        });

        draftActions.appendChild(card);
    });
}

// End the draft and display results
function endDraft() {
    const results = document.getElementById('results');
    const draftProcess = document.getElementById('draft-process');

    // Clear the available pool and hide the draft process UI
    availablePool = [];
    draftProcess.classList.add('hidden');

    // Display results
    results.classList.remove('hidden');
    results.innerHTML = `
        <h3>Draft Results</h3>
        <h4>Player 1 Pool</h4>
        <div>${player1Pool.map(p => `
            <div class="protocol-card">
                <strong>${p.Protocol}</strong><br>
                ${p.Top}<br>
                ${p.Bottom}<br>
                <em><b>Set: ${p.Set}</b></em>
            </div>
        `).join('')}</div>
        <h4>Player 2 Pool</h4>
        <div>${player2Pool.map(p => `
            <div class="protocol-card">
                <strong>${p.Protocol}</strong><br>
                ${p.Top}<br>
                ${p.Bottom}<br>
                <em><b>Set: ${p.Set}</b></em>
            </div>
        `).join('')}</div>
        <button id="start-over">Start Over</button>
    `;

    // Add event listener to the Start Over button
    document.getElementById('start-over').addEventListener('click', startOver);
}

// Start Over function
function startOver() {
    // Reset all variables
    availablePool = [];
    player1Pool = [];
    player2Pool = [];
    draftType = null;
    selectedSets = new Set();
    currentPlayer = 1;
    selectionsRemaining = 0;

    // Hide results and show draft type selection
    document.getElementById('results').classList.add('hidden');
    document.getElementById('draft-type').classList.remove('hidden');
}