
//popup if the pokemon was not found
// Add this with your other DOM elements
const notFoundPopup = document.getElementById('not-found-popup');
const searchedNameSpan = document.getElementById('searched-name');
const closePopupBtn = document.querySelector('.close-popup');

// Modify your existing fetchPokemon function's error handling:
async function fetchPokemon(nameOrId) {
    try {
        // ... existing loading code ...
        
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        
        // ... rest of your success code ...
        
    } catch (error) {
        showNotFoundPopup(nameOrId);
        console.error('Error fetching Pokémon:', error);
    }
}

function showNotFoundPopup(searchTerm) {
    searchedNameSpan.textContent = searchTerm;
    notFoundPopup.classList.add('show');
    
    // Reset the Pokémon display to default (Ditto)
    pokemonName.textContent = 'Ditto';
    pokemonId.textContent = '132';
    pokemonImage.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png';
    pokemonTypes.innerHTML = '<span class="type normal">Normal</span>';
    // Reset other fields as needed
}

// Close popup event
closePopupBtn.addEventListener('click', () => {
    notFoundPopup.classList.remove('show');
    searchInput.focus();
});

// Close when clicking outside popup
notFoundPopup.addEventListener('click', (e) => {
    if (e.target === notFoundPopup) {
        notFoundPopup.classList.remove('show');
    }
});



document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('pokemon-search');
    const searchBtn = document.getElementById('search-btn');
    const searchSuggestions = document.getElementById('search-suggestions');
    const pokemonName = document.getElementById('pokemon-name');
    const pokemonId = document.getElementById('pokemon-id');
    const pokemonImage = document.getElementById('pokemon-image');
    const pokemonTypes = document.getElementById('pokemon-types');
    const pokemonHeight = document.getElementById('pokemon-height');
    const pokemonWeight = document.getElementById('pokemon-weight');
    const pokemonExp = document.getElementById('pokemon-exp');
    const pokemonStats = document.getElementById('pokemon-stats');
    const pokemonAbilities = document.getElementById('pokemon-abilities');
    const pokemonMoves = document.getElementById('pokemon-moves');
    const evolutionStages = document.getElementById('evolution-stages');
    const pokemonCard = document.querySelector('.pokemon-card');
    const flipBtn = document.getElementById('flip-btn');
    const notification = document.getElementById('notification');
    const glowElement = document.querySelector('.glow');
    
    // Variables
    let allPokemonNames = [];
    let currentPokemonData = null;
    
    // Initialize
    fetchPokemon('ditto');
    fetchAllPokemonNames();
    
    // Event Listeners
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            fetchPokemon(searchTerm);
        }
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (searchTerm) {
                fetchPokemon(searchTerm);
            }
        } else {
            showSuggestions();
        }
    });
    
    flipBtn.addEventListener('click', () => {
        pokemonCard.classList.toggle('flipped');
    });
    
    // Functions
    async function fetchPokemon(nameOrId) {
        try {
            // Show loading state
            pokemonImage.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
            pokemonImage.style.filter = 'grayscale(1) opacity(0.5)';
            
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
            if (!response.ok) {
                throw new Error('Pokémon not found');
            }
            
            const data = await response.json();
            currentPokemonData = data;
            
            // Update UI with Pokémon data
            updatePokemonUI(data);
            
            // Fetch evolution chain
            const speciesResponse = await fetch(data.species.url);
            const speciesData = await speciesResponse.json();
            fetchEvolutionChain(speciesData.evolution_chain.url);
            
            // Hide suggestions
            searchSuggestions.classList.remove('show');
            
        } catch (error) {
            showNotification(error.message);
            console.error('Error fetching Pokémon:', error);
        }
    }
    
    function updatePokemonUI(data) {
        // Basic info
        pokemonName.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        pokemonId.textContent = data.id;
        
        // Image
        const officialArtwork = data.sprites.other['official-artwork'].front_default;
        const dreamWorld = data.sprites.other.dream_world.front_default;
        pokemonImage.src = officialArtwork || dreamWorld || data.sprites.front_default;
        pokemonImage.style.filter = '';
        pokemonImage.alt = data.name;
        
        // Types
        pokemonTypes.innerHTML = '';
        data.types.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.className = `type ${type.type.name}`;
            typeElement.textContent = type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1);
            pokemonTypes.appendChild(typeElement);
        });
        
        // Set glow color based on primary type
        if (data.types.length > 0) {
            const primaryType = data.types[0].type.name;
            glowElement.style.background = `radial-gradient(circle, var(--${primaryType}-type), transparent 70%)`;
        }
        
        // Height and weight
        pokemonHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
        pokemonWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;
        pokemonExp.textContent = data.base_experience || 'Unknown';
        
        // Stats
        pokemonStats.innerHTML = '';
        data.stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            const statName = document.createElement('div');
            statName.className = 'stat-name';
            statName.textContent = stat.stat.name.replace('-', ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            const statValue = document.createElement('div');
            statValue.className = 'stat-value';
            statValue.textContent = stat.base_stat;
            
            const statBarContainer = document.createElement('div');
            statBarContainer.className = 'stat-bar-container';
            
            const statBar = document.createElement('div');
            statBar.className = 'stat-bar';
            statBar.style.width = `${Math.min(100, stat.base_stat)}%`;
            
            statBarContainer.appendChild(statBar);
            statItem.appendChild(statName);
            statItem.appendChild(statValue);
            statItem.appendChild(statBarContainer);
            
            pokemonStats.appendChild(statItem);
        });
        
        // Abilities
        pokemonAbilities.innerHTML = '';
        data.abilities.forEach(ability => {
            const abilityElement = document.createElement('div');
            abilityElement.className = 'ability';
            abilityElement.textContent = ability.ability.name.replace('-', ' ');
            pokemonAbilities.appendChild(abilityElement);
        });
        
        // Moves (show first 20 moves)
        pokemonMoves.innerHTML = '';
        const movesToShow = data.moves.slice(0, 20);
        movesToShow.forEach(move => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move';
            moveElement.textContent = move.move.name.replace('-', ' ');
            pokemonMoves.appendChild(moveElement);
        });
    }
    
    async function fetchEvolutionChain(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // Process evolution chain
            displayEvolutionChain(data.chain);
        } catch (error) {
            console.error('Error fetching evolution chain:', error);
            evolutionStages.innerHTML = '<p>Evolution data not available</p>';
        }
    }
    
    function displayEvolutionChain(chain) {
        evolutionStages.innerHTML = '';
        
        // Recursive function to process evolution chain
        const processChain = (evolution) => {
            const stage = document.createElement('div');
            stage.className = 'evolution-stage';
            
            // Get Pokémon ID from URL
            const pokemonId = evolution.species.url.split('/').slice(-2, -1)[0];
            
            // Create image element
            const img = document.createElement('img');
            img.className = 'evolution-image';
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
            img.alt = evolution.species.name;
            img.onerror = () => {
                img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
            };
            
            // Create name element
            const name = document.createElement('div');
            name.className = 'evolution-name';
            name.textContent = evolution.species.name.charAt(0).toUpperCase() + evolution.species.name.slice(1);
            
            // Add click event to search for this Pokémon
            stage.addEventListener('click', () => {
                fetchPokemon(evolution.species.name);
                searchInput.value = evolution.species.name;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            stage.appendChild(img);
            stage.appendChild(name);
            evolutionStages.appendChild(stage);
            
            // Add arrow if there are evolutions
            if (evolution.evolves_to.length > 0) {
                const arrow = document.createElement('div');
                arrow.className = 'evolution-arrow';
                arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
                evolutionStages.appendChild(arrow);
                
                // Process next evolution(s)
                evolution.evolves_to.forEach(nextEvolution => {
                    processChain(nextEvolution);
                });
            }
        };
        
        // Start processing from the base form
        processChain(chain);
    }
    
    async function fetchAllPokemonNames() {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            const data = await response.json();
            allPokemonNames = data.results.map(pokemon => pokemon.name);
        } catch (error) {
            console.error('Error fetching Pokémon names:', error);
        }
    }
    
    function showSuggestions() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
            searchSuggestions.classList.remove('show');
            return;
        }
        
        const matchingPokemon = allPokemonNames.filter(name => 
            name.includes(searchTerm)
        ).slice(0, 10);
        
        if (matchingPokemon.length === 0) {
            searchSuggestions.classList.remove('show');
            return;
        }
        
        searchSuggestions.innerHTML = '';
        matchingPokemon.forEach(name => {
            const suggestion = document.createElement('div');
            suggestion.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            suggestion.addEventListener('click', () => {
                searchInput.value = name;
                fetchPokemon(name);
            });
            searchSuggestions.appendChild(suggestion);
        });
        
        searchSuggestions.classList.add('show');
    }
    
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Add animation to Pokémon image on hover
    pokemonImage.addEventListener('mouseenter', () => {
        pokemonImage.style.animation = 'pulse 1.5s infinite';
    });
    
    pokemonImage.addEventListener('mouseleave', () => {
        pokemonImage.style.animation = '';
    });
});

//terms and conditions and privacy policy and disclaimer

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const termsModal = document.getElementById('terms-modal');
    const privacyModal = document.getElementById('privacy-modal');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    
    // Get link elements
    const termsLink = document.getElementById('terms-link');
    const privacyLink = document.getElementById('privacy-link');
    const disclaimerLink = document.getElementById('disclaimer-link');
    
    // Get close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Open modals
    termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        termsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    disclaimerLink.addEventListener('click', (e) => {
        e.preventDefault();
        disclaimerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            termsModal.style.display = 'none';
            privacyModal.style.display = 'none';
            disclaimerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close when clicking outside modal
    window.addEventListener('click', (e) => {
        if (e.target === termsModal) {
            termsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === privacyModal) {
            privacyModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === disclaimerModal) {
            disclaimerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

