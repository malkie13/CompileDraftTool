# CompileDraftTool
Drafting tool for the Compile card game. Just python scripts for now, turning them into something more than that is a bit beyond my skillset at this time.

DBtool.py is a python tool to take a csv file, formatted and named like the included protocols.csv, to create a properly formatted protocols.json. It can also be used to append new entries to protcols.json.

CompileDraftTool.py is the original python script for guiding players through the draft process of the Compile card game by Greater Than Games, it uses protocols.json as the database of available protocols and includes two draft formats: Standard (the format from the original rules) and Blind Elimination (randomly eliminates from the total pool down to a pool of 9 protocols, promptes players to each eliminate a protocol, then proceeds with the draft process).
