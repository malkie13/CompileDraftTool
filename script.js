// protocols.json should be loaded via an AJAX call or included directly in the HTML
let protocols = [];

// Load protocols from protocols.json
function loadProtocols(callback) {
    fetch('protocols.json')
        .then(response => response.json())
        .then(data => {
            protocols = data;
            callback();
        })
        .catch(error => console.error('Error loading protocols:', error));
}

// Function to filter protocols by selected sets
function filterProtocolsBySets(selectedSets) {
    return protocols.filter(protocol => selectedSets.includes(protocol.Set));
}

// Function to display available protocols
function displayProtocols(protocols, prompt, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<h3>${prompt}</h3>`;
    protocols.forEach((protocol, index) => {
        element.innerHTML += `<p>${index + 1}. ${protocol.Protocol}: ${protocol.Top} - ${protocol.Bottom} (${protocol.Set})</p>`;
    });
}

// Function to validate user input for protocol selection
function getProtocolChoice(protocols, prompt, maxSelections = 1) {
    let choices = prompt(prompt).trim().split(' ');
    if (choices.length !== maxSelections) {
        alert(`Error: You must select exactly ${maxSelections} protocol(s).`);
        return null;
    }
    let selectedIndices = choices.map(choice => parseInt(choice) - 1);
    if (selectedIndices.some(idx => idx < 0 || idx >= protocols.length)) {
        alert(`Error: Please enter numbers between 1 and ${protocols.length}.`);
        return null;
    }
    return selectedIndices;
}

// Function for Standard Draft
function standardDraft(availablePool) {
    let player1Pool = [];
    let player2Pool = [];

    // Player 1 selects 1 protocol
    displayProtocols(availablePool, "Player 1's turn", "player1-turn");
    let choice = getProtocolChoice(availablePool, "Player 1, choose a protocol (by number):", 1);
    player1Pool.push(availablePool.splice(choice[0], 1)[0]);

    // Player 2 selects 2 protocols
    displayProtocols(availablePool, "Player 2's turn", "player2-turn");
    let choices = getProtocolChoice(availablePool, "Player 2, choose 2 protocols (by numbers, separated by spaces):", 2);
    choices.sort((a, b) => b - a).forEach(choice => {
        player2Pool.push(availablePool.splice(choice, 1)[0]);
    });

    // Player 1 selects 2 protocols
    displayProtocols(availablePool, "Player 1's turn", "player1-turn");
    choices = getProtocolChoice(availablePool, "Player 1, choose 2 protocols (by numbers, separated by spaces):", 2);
    choices.sort((a, b) => b - a).forEach(choice => {
        player1Pool.push(availablePool.splice(choice, 1)[0]);
    });

    // Player 2 selects 1 protocol
    displayProtocols(availablePool, "Player 2's turn", "player2-turn");
    choice = getProtocolChoice(availablePool, "Player 2, choose a protocol (by number):", 1);
    player2Pool.push(availablePool.splice(choice[0], 1)[0]);

    return [player1Pool, player2Pool];
}

// Function for Blind Elimination Draft
function blindEliminationDraft(availablePool) {
    let player1Pool = [];
    let player2Pool = [];

    // Randomly eliminate all but 9 protocols
    while (availablePool.length > 9) {
        availablePool.splice(Math.floor(Math.random() * availablePool.length), 1);
    }

    // Player 1 eliminates 1 protocol
    displayProtocols(availablePool, "Player 1's turn to eliminate", "player1-turn");
    let choice = getProtocolChoice(availablePool, "Player 1, choose a protocol to eliminate (by number):", 1);
    availablePool.splice(choice[0], 1);

    // Player 2 eliminates 1 protocol
    displayProtocols(availablePool, "Player 2's turn to eliminate", "player2-turn");
    choice = getProtocolChoice(availablePool, "Player 2, choose a protocol to eliminate (by number):", 1);
    availablePool.splice(choice[0], 1);

    // Continue with Standard Draft rules
    console.log("\nContinuing with Standard Draft rules...");
    [player1Pool, player2Pool] = standardDraft(availablePool);

    return [player1Pool, player2Pool];
}

// Main function
function main() {
    loadProtocols(() => {
        // Get all available sets and count protocols in each set
        let setCounts = {};
        protocols.forEach(protocol => {
            setCounts[protocol.Set] = (setCounts[protocol.Set] || 0) + 1;
        });
        let allSets = Object.keys(setCounts).sort();

        // Prompt for sets to use
        let selectedSets = allSets; // Default to all sets

        // Filter protocols by selected sets
        let availablePool = filterProtocolsBySets(selectedSets);
        if (availablePool.length < 9) {
            alert(`Error: The selected sets must contain at least 9 protocols. Only ${availablePool.length} protocols are available.`);
            return;
        }

        console.log(`${availablePool.length} protocols available in the selected set(s).`);

        // Prompt for draft rules
        let draftChoice = prompt("Choose draft rules:\n1. Standard Draft\n2. Blind Elimination Draft\nEnter the number of your choice (1 or 2):");
        if (draftChoice === '1') {
            let [player1Pool, player2Pool] = standardDraft(availablePool);
            displayResults(player1Pool, player2Pool);
        } else if (draftChoice === '2') {
            let [player1Pool, player2Pool] = blindEliminationDraft(availablePool);
            displayResults(player1Pool, player2Pool);
        } else {
            alert("Invalid choice. Please enter 1 or 2.");
        }
    });
}

// Function to display results
function displayResults(player1Pool, player2Pool) {
    let resultsElement = document.getElementById('results');
    resultsElement.innerHTML = "<h2>Draft complete!</h2>";
    resultsElement.innerHTML += "<h3>Player 1 Protocols:</h3>";
    player1Pool.forEach(protocol => {
        resultsElement.innerHTML += `<p>- ${protocol.Protocol} (${protocol.Set})</p>`;
    });
    resultsElement.innerHTML += "<h3>Player 2 Protocols:</h3>";
    player2Pool.forEach(protocol => {
        resultsElement.innerHTML += `<p>- ${protocol.Protocol} (${protocol.Set})</p>`;
    });
}

// Run the app
document.addEventListener('DOMContentLoaded', main);
