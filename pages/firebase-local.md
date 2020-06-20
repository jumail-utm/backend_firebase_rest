# Setting Up Local Firebase for Development

## Install Firebase Emulator on Local PC

- [Install Java](https://openjdk.java.net/install/) version 1.8 or higher

- [Install Node JS](https://nodejs.org/en/download) version 7.8.0 or higher
- Install Firebase CLI tools with `npm` (version 8.4.1 or higher)

  ```bash
  # install firebase CLI tools
  $ npm i -g firebase-tools

  # Check the version of the tools. If your version is older, upgrade the tools by issuing the same "npm" command above.
  $ firebase --version

  # Check available commands.
  $ firebase help

  # List all your firebase projects
  $ firebase projects:list
  ```

- [Sign in with your Google account](https://accounts.google.com). If you don't have one, [sign-up here](https://accounts.google.com/signup?hl=en)
- Create a Firebase web app project online via the [Firebase console](https://console.firebase.google.com/)
  - Add a new project
  - Set up default resource location (e.g. asia-southeast2). [List of Google Cloud Platform (GCP) Resource Locations](https://firebase.google.com/docs/projects/locations)
  - Add a Firestore database to the project.
    - Choose **"Start in test mode"** for now.

## Create Local Firebase Project

Run the following commands on a git bash terminal

```bash
# Create a new folder for the project
$ mkdir backend_firebase_rest
$ cd backend_firebase_rest

# Initialize the directory as a firebase project
# Choose these features to setup for this project:  Firestore, Function, Emulators
# On selecting a default Firebase project:
#     - Choose an existing project (and choose the project that you created before, in the previous steps)
#     - Accept the default values for other settings
# On Emulators features setup:
#     - Choose Functions and Firestore
#     - Accept the default values for other settings
#     - Would you like to download the emulators now? Choose Yes

$ firebase init
```

**Note**: _If Firebase CLI does not work on external git bash terminal, switch to `Powershell` or `cmd`, or use integrated terminal in VSCode_

## Run Firebase Emulators

```bash
# To run the emulators
# The emulator UI should be available at http://localhost:4000

$ firebase emulators:start
```
