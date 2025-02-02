document.addEventListener('DOMContentLoaded', function () {
    const cardsContainer = document.getElementById('cards-container');
    const filtersContainer = document.getElementById('filters');
    const allSetsCheckbox = document.getElementById('all-sets');

    // Load JSON data
    fetch('protocols.json')
        .then(response => response.json())
        .then(data => {
            let cards = data;

            // Extract unique sets from the data
            const uniqueSets = [...new Set(cards.map(card => card.Set))];

            // Function to generate set checkboxes
            function generateSetCheckboxes() {
                uniqueSets.forEach(set => {
                    const label = document.createElement('label');
                    label.innerHTML = `
                        <input type="checkbox" class="set-filter" value="${set}"> ${set}
                    `;
                    filtersContainer.appendChild(label);
                });
            }

            // Generate checkboxes
            generateSetCheckboxes();

            // Get all set checkboxes after they are generated
            const setCheckboxes = document.querySelectorAll('.set-filter');

            // Function to render cards
            function renderCards(selectedSets = []) {
                cardsContainer.innerHTML = ''; // Clear existing cards
                cards.forEach(card => {
                    if (selectedSets.length === 0 || selectedSets.includes(card.Set)) {
                        const cardElement = document.createElement('div');
                        cardElement.className = 'card';
                        cardElement.innerHTML = `
                            <h2>${card.Protocol}</h2>
                            <p>${card.Top}</p>
                            <p>${card.Bottom}</p>
                            <p class="set"><strong>Set:</strong> ${card.Set}</p>
                        `;
                        cardsContainer.appendChild(cardElement);
                    }
                });
            }

            // Function to get selected sets
            function getSelectedSets() {
                if (allSetsCheckbox.checked) return []; // Show all sets
                const selectedSets = [];
                setCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) selectedSets.push(checkbox.value);
                });
                return selectedSets;
            }

            // Initial render
            renderCards();

            // Event listeners for checkboxes
            allSetsCheckbox.addEventListener('change', function () {
                if (this.checked) {
                    setCheckboxes.forEach(checkbox => checkbox.checked = false);
                }
                renderCards(getSelectedSets());
            });

            setCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        allSetsCheckbox.checked = false;
                    }
                    renderCards(getSelectedSets());
                });
            });
        })
        .catch(error => console.error('Error loading JSON data:', error));
});
