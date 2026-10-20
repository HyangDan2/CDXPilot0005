# HD2Lab Game README Generation Guide

This guide explains how to generate READMEs for game projects at HD2Lab. It uses the structure of VALKYRIE's README as a reference. Copy this guide into another game repository or provide it to an AI assistant with the prompt in Section 5. Replace project names, technologies, and commands with information verified in the target repository.

## 1. Design the Reading Order

Organize the README so a first-time visitor can answer these questions in order:

1. What kind of game is this, and what does the player do?
2. Where can I play, download, or preview it?
3. What are its main features, and how do I play?
4. How do I run it locally?
5. How do I develop, test, and deploy it?
6. What are its current limitations, and where can I find more detail?

**Show the game first, then explain development.** Avoid opening with a long development history or a list of technologies.

## 2. Gather Evidence Before Writing

| Source                          | What to verify                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Project configuration           | Name, required runtime versions, package manager, and actual commands            |
| Source and tests                | Implemented mechanics, gameplay flow, and supported features                     |
| Gameplay captures               | Representative gameplay, distinct mechanics, and mobile controls when applicable |
| CI and deployment configuration | Checks, deployment triggers, artifacts, and required setup                       |
| Existing documentation          | Architecture, maintenance, changelog, QA, licenses, and asset provenance         |
| Unconfirmed information         | Untested environments, known limitations, and deployment verification status     |

Distinguish a command found in configuration from a command you actually ran successfully. A successful local build does not prove a successful remote deployment. Do not guess licenses or supported environments.

## 3. Writing Rules by Section

### Title and Introduction

Use the game name and a short subtitle. In two or three sentences, describe the genre, the player's role or objective, and the runtime environment.

> [Game name] is a [genre] game where you play as [role] and [main objective]. [Describe the core gameplay loop]. It runs on [platform or environment].

Mention the technology stack only where it helps readers understand the project. Describe actual gameplay instead of using claims such as “revolutionary” or “powerful.”

### Play Links and Hero Image

Place the primary link immediately below the introduction. Choose an available action such as playing the game, downloading a build, or watching a gameplay preview. Add secondary links such as the changelog when useful.

Use one representative screenshot of actual gameplay as the hero image. Add a one-sentence caption explaining what it shows.

- Use relative paths for images stored in the repository.
- Describe the action or game state in image alt text.
- Start with about two additional screenshots showing distinct mechanics or situations.
- Use a table for two comparable screenshots when helpful. Stack images vertically when small text must remain readable.
- Check that captures contain no personal information or tokens.
- Do not insert nonexistent screenshots or demo links as if they were available.

### Features

Group the main player-facing features into about four to six bullets. Explain both the mechanic and its effect on gameplay.

| Avoid                  | Prefer                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Diverse combat system  | Switch between sword and bow, then use directional guarding and dodges to respond to enemy attacks.           |
| Exciting encounters    | Fight through three regular encounters before facing a boss that calls reinforcements.                        |
| Perfect mobile support | Landscape touch controls are available. Document physical-device testing coverage in the limitations section. |

Include only features implemented in the target game. Keep planned features separate and link to a roadmap if needed.

### Controls and How to Play

Explain the minimum steps needed to start playing and understand the objective. Provide an input-to-action table, then explain timing, resource costs, or conditions that affect those actions.

Document keyboard, touch, and controller input only when supported. For touch controls, describe orientation requirements and gestures. Explain how a run or stage ends, how to pause or restart, and any progression or save behavior relevant to players.

Keep exceptions beside the mechanic they affect. Detailed combat formulas or complete design specifications belong in separate documentation.

### Local Setup

Use this order: requirements → installation → launch → where to access the game. Separate development-server instructions from building and previewing a production build.

- Match commands to the target project's lockfile and package manager.
- If environment variables are required, link to an example configuration and explain setup without including real secrets.
- Verify the default port and output directory in configuration.
- Explain any required services or tools before the launch step.

### Development and Structure

Summarize common checks in a `Command | Purpose` table and key directories in a `Path | Responsibility` table. Do not list every file.

Document prerequisites such as installing a browser for E2E tests, and note checks that conflict when run concurrently. Link to separate documents for detailed architecture, asset pipelines, and maintenance procedures.

### Deployment

Explain the deployment destination, triggers, published artifacts, and settings the repository owner must configure. Identify setup that differs between the original repository and a fork.

An automatic deployment configuration is not evidence that the live game currently works. If the hosting method is undecided, do not invent one.

### Documentation and Limitations

Finish with links to detailed documentation and a concrete description of the current scope. Mention unsupported features, untested platforms, and asset limitations. Link to licenses and provenance when verified documentation exists.

For games, relevant limitations may include stage count, save support, multiplayer, input support, browser or device coverage, and animation or audio constraints. Include only limitations that apply to the target game.

## 4. Copyable README Template

Every `<...>` entry below is a placeholder to replace. Remove unavailable links, images, commands, and unsupported input methods. Write the README in English unless a different language is explicitly requested.

````markdown
# <Game name> — <Short subtitle>

<Describe the genre, player role, core objective, and runtime environment in two or three sentences.>

**[<Play now / Download / Gameplay preview>](<Verified URL>)** · [Changelog](<Changelog path>)

![<Action or game state shown in the screenshot>](<Relative hero image path>)

_<One sentence explaining the gameplay shown.>_

## Features

- <Implemented mechanic and its effect on gameplay>
- <Implemented mechanic and its effect on gameplay>
- <Implemented mechanic and its effect on gameplay>
- <Implemented mechanic and its effect on gameplay>

## Controls

| Input            | Action          |
| ---------------- | --------------- |
| <Verified input> | <Player action> |
| <Verified input> | <Player action> |

<Explain relevant timing, costs, conditions, and supported touch or controller input.>

## How to Play

1. <How to start a game or run>
2. <Core actions and immediate objective>
3. <Win/loss conditions and how to retry>

<Explain progression or save behavior when relevant.>

## Getting Started

Requires **<Runtime and minimum version>** and <Package manager or required tools>.

```bash
<Dependency installation command>
<Development launch command>
```

<Local URL or instructions for accessing the running game>

To build and preview:

```bash
<Build command>
<Production preview command>
```

<Output directory and required serving conditions>

## Development

| Command                         | Purpose            |
| ------------------------------- | ------------------ |
| `<Actual verification command>` | <Checks performed> |
| `<Actual test command>`         | <Test scope>       |

<Prerequisites and any restrictions on running checks>

### Project structure

| Path                | Responsibility       |
| ------------------- | -------------------- |
| `<Core directory>`  | <Responsibility>     |
| `<Asset directory>` | <Responsibility>     |
| `<Test directory>`  | <Verification scope> |

<One or two sentences about core design principles, with links to detailed documentation>

## Deployment

<Deployment destination, triggers, artifacts, and required configuration>

## Documentation and Limitations

- [<Document name>](<Verified document path>)
- [<Document name>](<Verified document path>)

<Current gameplay scope and unsupported features>

<Tested environments, untested environments, and known constraints>
````

## 5. Reusable AI Prompt

Provide the following prompt together with this guide. Use an assistant that can inspect the target repository so the README reflects the actual implementation.

```text
Create or improve this game's README.md using the attached HD2Lab Game README
Generation Guide. Write the README in English.

First inspect the repository's contributor instructions, existing README,
project configuration, scripts, source, tests, CI and deployment configuration,
and supporting documentation. Preserve important existing information and
user edits.

Use this order, omitting sections that do not apply:
1. Game name and a short introduction covering genre, player role, and objective
2. Available play/download/preview links and a representative gameplay screenshot
3. Main player-facing features
4. Controls and enough instructions to start playing and understand the objective
5. Requirements and local setup, build, and preview instructions
6. Development checks and the responsibilities of key directories
7. Deployment instructions grounded in actual configuration
8. Detailed documentation links and current limitations

Describe only implemented features. Verify commands and paths in the repository.
Use actual gameplay screenshots with descriptive alt text and short captions.
Do not invent links, screenshots, or verification results when evidence is missing.
Distinguish future plans, untested environments, and deployment status from
verified implementation.
Keep the README concise and link to existing documents for detailed explanations.
Do not change unrelated code or deployment configuration to complete documentation.

When finished, report the changed files, what you verified, which checks you ran,
and anything that remains unconfirmed.
```

## 6. Pre-publication Checklist

- [ ] The opening explains what kind of game this is and what the player does.
- [ ] Primary links and image paths point to real destinations.
- [ ] Features, controls, and gameplay instructions match the current implementation.
- [ ] Commands, required versions, environment setup, and output paths are verified.
- [ ] Executed checks are distinguished from configuration inspection.
- [ ] Deployment requirements are documented without assuming deployment success.
- [ ] Untested environments and known limitations are stated.
- [ ] No placeholders or names and URLs from another project remain.
- [ ] Tables, code blocks, and screenshots are readable in a Markdown preview.

The reusable structure is **introduction → gameplay preview → how to play → local setup → development and deployment → limitations**. Adapt the content to each game rather than copying another game's claims.
