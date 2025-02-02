# CompileDraftTool
Drafting tool for the Compile card game. 

These are my original python scripts.
DBtool.py is a python tool to take a csv file, formatted and named like the included protocols.csv, to create a properly formatted protocols.json. It can also be used to append new entries to protcols.json.

CompileDraftTool.py is the original python script for guiding players through the draft process of the Compile card game by Greater Than Games, it uses protocols.json as the database of available protocols and includes two draft formats: Standard (the format from the original rules) and Blind Elimination (randomly eliminates from the total pool down to a pool of 9 protocols, promptes players to each eliminate a protocol, then proceeds with the draft process).

With the aid fo DeepSeek I built out a java app as it exists now and can be accessed at https://malkie13.github.io/CompileDraftTool/
