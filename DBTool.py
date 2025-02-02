import csv
import json
import os

# Define the input and output file names
input_csv_file = 'Protocols.csv'
output_json_file = 'protocols.json'

# Initialize an empty list to store the data
data = []

# Read the CSV file and convert it to a list of dictionaries
with open(input_csv_file, mode='r', newline='', encoding='utf-8-sig') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    # Strip any extra spaces from the header names
    csv_reader.fieldnames = [name.strip() for name in csv_reader.fieldnames]
    print("CSV Header:", csv_reader.fieldnames)  # Print the cleaned header row
    for row in csv_reader:
        if 'Protocol' not in row:
            print(f"Skipping row with missing 'Protocol' key: {row}")
            continue
        data.append(row)

# Check if protocols.json exists
if os.path.exists(output_json_file):
    # Load existing JSON data
    with open(output_json_file, mode='r', encoding='utf-8') as json_file:
        existing_data = json.load(json_file)
    
    # Create a set of existing protocols for quick lookup
    existing_protocols = {item['Protocol'] for item in existing_data}
    
    # Append only new entries from the CSV data
    new_entries = [row for row in data if row['Protocol'] not in existing_protocols]
    if new_entries:
        print(f"Found {len(new_entries)} new entries to append.")
        existing_data.extend(new_entries)
    else:
        print("No new entries found.")
    
    # Sort the combined data alphabetically by the 'Protocol' field
    sorted_data = sorted(existing_data, key=lambda x: x['Protocol'])
else:
    # If protocols.json doesn't exist, use the CSV data as is
    print(f"'{output_json_file}' does not exist. Creating a new file.")
    sorted_data = sorted(data, key=lambda x: x['Protocol'])

# Write the sorted data to the JSON file
with open(output_json_file, mode='w', encoding='utf-8') as json_file:
    json.dump(sorted_data, json_file, indent=4)

print(f"Data has been successfully written to '{output_json_file}' in alphabetical order.")