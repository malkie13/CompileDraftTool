import json
import random

# Load protocols from protocols.json
def load_protocols(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: The file '{filename}' was not found. Please ensure it exists in the same directory as this script.")
        exit()
    except json.JSONDecodeError:
        print(f"Error: The file '{filename}' contains invalid JSON. Please check its format.")
        exit()

# Function to filter protocols by selected sets
def filter_protocols_by_sets(protocols, selected_sets):
    return [protocol for protocol in protocols if protocol['Set'] in selected_sets]

# Function to display available protocols
def display_protocols(protocols, prompt):
    print(f"\n{prompt}:")
    for i, protocol in enumerate(protocols):
        print(f"{i + 1}. {protocol['Protocol']}: {protocol['Top']} - {protocol['Bottom']} ({protocol['Set']})")

# Function to validate user input for protocol selection
def get_protocol_choice(protocols, prompt, max_selections=1):
    while True:
        try:
            choices = input(prompt).strip().split()
            if not choices:
                print("Error: No input provided. Please make a selection.")
                continue
            if choices[0].lower() == 'q':  # Check for Quit
                print("\nDraft Aborted.")
                exit()
            if len(choices) != max_selections:
                print(f"Error: You must select exactly {max_selections} protocol(s).")
                continue
            selected_indices = [int(choice) - 1 for choice in choices]
            if len(set(selected_indices)) != len(selected_indices):
                print("Error: Duplicate selections are not allowed. Please choose unique protocols.")
                continue
            if all(0 <= idx < len(protocols) for idx in selected_indices):
                return selected_indices
            else:
                print(f"Error: Please enter numbers between 1 and {len(protocols)}.")
        except ValueError:
            print("Error: Please enter numbers only.")

# Function for Standard Draft
def standard_draft(available_pool):
    player1_pool = []
    player2_pool = []

    # Player 1 selects 1 protocol
    display_protocols(available_pool, "Player 1's turn")
    choice = get_protocol_choice(available_pool, "Player 1, choose a protocol (by number) or Q to quit: ", max_selections=1)
    player1_pool.append(available_pool.pop(choice[0]))

    # Player 2 selects 2 protocols
    display_protocols(available_pool, "Player 2's turn")
    choices = get_protocol_choice(available_pool, "Player 2, choose 2 protocols (by numbers, separated by spaces) or Q to quit: ", max_selections=2)
    for choice in sorted(choices, reverse=True):
        player2_pool.append(available_pool.pop(choice))

    # Player 1 selects 2 protocols
    display_protocols(available_pool, "Player 1's turn")
    choices = get_protocol_choice(available_pool, "Player 1, choose 2 protocols (by numbers, separated by spaces) or Q to quit: ", max_selections=2)
    for choice in sorted(choices, reverse=True):
        player1_pool.append(available_pool.pop(choice))

    # Player 2 selects 1 protocol
    display_protocols(available_pool, "Player 2's turn")
    choice = get_protocol_choice(available_pool, "Player 2, choose a protocol (by number) or Q to quit: ", max_selections=1)
    player2_pool.append(available_pool.pop(choice[0]))

    return player1_pool, player2_pool

# Function for Blind Elimination Draft
def blind_elimination_draft(available_pool):
    player1_pool = []
    player2_pool = []

    # Randomly eliminate all but 9 protocols
    while len(available_pool) > 9:
        available_pool.pop(random.randint(0, len(available_pool) - 1))

    # Player 1 eliminates 1 protocol
    display_protocols(available_pool, "Player 1's turn to eliminate")
    choice = get_protocol_choice(available_pool, "Player 1, choose a protocol to eliminate (by number) or Q to quit: ", max_selections=1)
    available_pool.pop(choice[0])

    # Player 2 eliminates 1 protocol
    display_protocols(available_pool, "Player 2's turn to eliminate")
    choice = get_protocol_choice(available_pool, "Player 2, choose a protocol to eliminate (by number) or Q to quit: ", max_selections=1)
    available_pool.pop(choice[0])

    # Continue with Standard Draft rules
    print("\nContinuing with Standard Draft rules...")
    player1_pool, player2_pool = standard_draft(available_pool)

    return player1_pool, player2_pool

# Main function
def main():
    # Load protocols
    protocols = load_protocols('protocols.json')

    # Get all available sets and count protocols in each set
    set_counts = {}
    for protocol in protocols:
        set_name = protocol['Set']
        set_counts[set_name] = set_counts.get(set_name, 0) + 1
    all_sets = sorted(set_counts.keys())  # Sort for consistent display

    # Prompt for sets to use
    while True:
        print("\nAvailable sets:")
        for i, set_name in enumerate(all_sets):
            print(f"{i + 1}. {set_name} ({set_counts[set_name]})")
        print("Press Enter to use all sets or Q to quit.")
        choices = input("Enter the numbers of the sets to use (separated by spaces): ").strip().split()
        if not choices:
            selected_sets = set(all_sets)  # Default to all sets
        elif choices[0].lower() == 'q':  # Check for Quit
            print("\nDraft Aborted.")
            return
        else:
            try:
                selected_indices = [int(choice) - 1 for choice in choices]
                if any(idx < 0 or idx >= len(all_sets) for idx in selected_indices):
                    print(f"Error: Please enter numbers between 1 and {len(all_sets)}.")
                    continue
                selected_sets = set(all_sets[idx] for idx in selected_indices)
            except ValueError:
                print("Error: Please enter numbers only.")
                continue

        # Filter protocols by selected sets
        available_pool = filter_protocols_by_sets(protocols, selected_sets)
        if len(available_pool) < 9:
            print(f"Error: The selected sets must contain at least 9 protocols. Only {len(available_pool)} protocols are available.")
            continue
        break

    print(f"\n{len(available_pool)} protocols available in the selected set(s).")

    # Prompt for draft rules
    print("\nChoose draft rules:")
    print("1. Standard Draft")
    print("2. Blind Elimination Draft")
    while True:
        try:
            draft_choice = input("Enter the number of your choice (1 or 2) or Q to quit: ").strip().lower()
            if draft_choice == 'q':  # Check for Quit
                print("\nDraft Aborted.")
                return
            draft_choice = int(draft_choice)
            if draft_choice in [1, 2]:
                break
            else:
                print("Error: Please enter 1 or 2.")
        except ValueError:
            print("Error: Please enter a number.")

    # Echo back the selected draft rules
    draft_rules = "Standard Draft" if draft_choice == 1 else "Blind Elimination Draft"
    print(f"\nDraft Rules: {draft_rules}")

    # Run the selected draft
    if draft_choice == 2:
        player1_pool, player2_pool = blind_elimination_draft(available_pool)
    else:
        player1_pool, player2_pool = standard_draft(available_pool)

    # Display results
    print("\nDraft complete!")
    print("\nPlayer 1 Protocols:")
    for protocol in player1_pool:
        print(f"- {protocol['Protocol']} ({protocol['Set']})")

    print("\nPlayer 2 Protocols:")
    for protocol in player2_pool:
        print(f"- {protocol['Protocol']} ({protocol['Set']})")

# Run the app
if __name__ == "__main__":
    main()