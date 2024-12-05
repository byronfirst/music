# Various music code

### Adding spotify api applicaiton wrapped is wrong

#### Future integration with social page, user profile, setlistfm api integration for tracking and reviewing concert

--- 

## Wrapped is Wrong

### Directory Structure
```
├── dist/
├── index.html
├── node_modules/
├── package-lock.json
├── package.json
├── public/
├── src/
│   ├── vite-env.d.ts
│   ├── typescript.svg
│   ├── style.css
│   ├── main.ts
│   ├── counter.ts
│   └── script.ts
└── tsconfig.json
```

### Important Files
`index.html` - main index file that handles front end HTML
`src/script.ts` - main typscript file that handles all API calls and JavaScript functions called within the index files


### Dev Installation

##### Prerequisites
- A [Node.js LTS](https://nodejs.org/en/) environment or later.
- [npm](https://docs.npmjs.com/) version 7 or later
- A [Spotify account](https://accounts.spotify.com/)

```
npm create vite@latest wrappediswrong -- --template vanilla-ts

cd wrappediswrong

# copy files from wherever you downloaded the repo
cp ../index.html .
cp ../src/script.ts src/script.ts

npm install

npm run dev
```

### To Do
- [ ] Fix favicon.io 
- [ ] Add logos
- [ ] Fix CSS (center main widgets etc)
- [ ] Add setlistfm api integration
- [ ] Verify CSS/HTML rendering for mobile

### Documentation Links
[Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)


Reach out with any questions
