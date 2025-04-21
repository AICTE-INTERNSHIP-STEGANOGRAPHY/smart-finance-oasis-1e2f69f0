# SMART FINANCE OASIS

Finance-management and budget-tracking application


## ENVISAGE 2025 

Website link: [https://envisage.org.in/]

This web and mobile application was created for the event of HACK-UR-WAY under the fest ENVISAGE 2025. 


## PROBLEM STATEMENT

Problem code:   WEB-002 (Personal Finance Buddy). 

Problem statement: Priya, a college student on a tight budget, struggles to manage her monthly expenses. With limited income from allowances or part-time jobs, she finds it hard to track spending, often overspends, and rarely saves for personal goals—like buying a concert ticket. She needs a simple, smart solution to monitor her expenses, categorize spending, and get personalized money- saving tips. The goal is to build a personal finance assistant that helps students like Priya take control of their finances through features like budget tracking, goal setting, smart insights, and spending alerts— making money management easier and more effective. 


### WEB APPLICATION LINK 
[SMART FINANCE OASIS](https://youtu.be/vXNFzABnuhQ?si=yjdLVUAVMrsi9uww) 


### YOUTUBE VIDEO LINK
[SMART FINANCE OASIS- explanatory video](https://preview--smart-finance-oasis.lovable.app/login) 


## FEATURES

This application has been created keeping in mind the tight and stressful schedule of college students so that they may be able to record, track, and manage their income, expenses, and savings more effectively. It offers the following features: 

1. Login/sign up page.
2. Left-hand side menu bar- to navigate to all parts of the application.   
3. Profile- add/edit profile, country of residence, currency.   
4. Home page dashboard- total budget, income, expenses, savings (monthly basis), graphical representation.   
5. Earnings/Income- add/delete income source, add income source category, contratulating message. 
6. Expenditures- add/delete expenses, add expense category, warning message.   
7. Savings- add/delete savings, add savings category, contratulating message.   
8. Personal Goals- add/delete personal goals, add personal goals category, mark goal completion, contratulating message.   
9. AI FINANCE ASSISTANT- AI chatbot for effective and useful solutions and suggestions and smart insights.    
10. Notifications- all messages/notifications.
11. Security (settings)- higher protection, changing password.
12. Settings
13. Day/Night mode.
14. Log out.


## SCREENSHOTS 



![Screenshot_2025-04-21_21-54-27](https://github.com/user-attachments/assets/51291771-b624-4b7d-b8b0-ef3594ded6b3)
![Screenshot_2025-04-21_21-53-21](https://github.com/user-attachments/assets/d244fb78-e9b2-4cc7-82c1-b7ef6c98735e)
![Screenshot_2025-04-21_21-53-14](https://github.com/user-attachments/assets/69dd7107-991d-4eb8-93ed-c0f0edf47d37)
![Screenshot_2025-04-21_21-53-06](https://github.com/user-attachments/assets/deb15a75-f119-4cb7-b8af-790b5d7e7316)
![Screenshot_2025-04-21_21-52-39](https://github.com/user-attachments/assets/3b79aa6c-8168-4e17-a0b1-fa5a60caf5f3)
![Screenshot_2025-04-21_21-52-24](https://github.com/user-attachments/assets/0001ee93-cc23-49ba-8550-75bafdbbcb3e)
![Screenshot_2025-04-21_21-48-32](https://github.com/user-attachments/assets/fd794e3b-2847-4a4e-a977-c3ecd83327c6)
![Screenshot_2025-04-21_21-48-24](https://github.com/user-attachments/assets/450e0e9a-74cc-41de-a88e-05f963a961e3)


## TECHNOLOGY USED 

### I. Tech Stack:
    1. Vite (build tool)
    2. React (frontend UI library)
    3. TypeScript (typed JavaScript)
    4. Tailwind CSS (utility-first CSS framework) 
    5. supabase-js (backend interaction)
    6. shadcn/ui (component library with Radix UI primitives)
    7. Tanstack React Query (for data fetching and state management)
    8. Sonner (for toast notifications)
    9. Lucide-react (icon library)
    10. date-fns (date utility functions)
    11. Next-themes (theme management)
    12. Other Radix UI primitives (select, popover, checkbox, etc.) 

### II. Frontend Development:
    1. TypeScript
    2. JavaScript (within the React/TypeScript ecosystem)

### III. Backend Development: 
    1. JavaScript 

### IV. Database: 
    1. Supabase (PostgreSQL) 

### V. APIs: 
    1. Built-in JavaScript Intl API (currency formatting)
    2. date-fns library (date formatting)
    3. OpenAI's GPT API 

### VI. AI FINANCE ASSISTANT chatbot: powered by OpenAI's GPT API integrated via Supabase. 


## INSTALLATION

### I. AS A WEB APP
Open this URL in the phone's browser: [SMART FINANCE OASIS](https://preview--smart-finance-oasis.lovable.app/login) 

### II. AS A NATIVE APP 
1. Clone the repository to your local machine:
```
git clone <YOUR_GITHUB_REPO_URL>
cd <YOUR_PROJECT_DIRECTORY>
```
2. Install dependencies:
```
npm install
```
3. Add Capacitor for native mobile support:

Add Capacitor and initialize it using the recommended App ID and App Name.
```
npm install @capacitor/core @capacitor/cli
npx cap init
```
When prompted, set:

•	App name: smart-finance-oasis 

•	App ID: app.lovable.280cb5b0d9c841928c2dff83bff6ddfe 

Then add the necessary platforms:
```
npx cap add ios
npx cap add android
```

4.	Build the app's production version:
```
npm run build
```
5.	Sync the web assets to Capacitor:
```
npx cap sync
```
6.	Open the project in native IDEs:

•	For iOS:
```
npx cap open ios
```
Then use Xcode to build and run on a simulator or device. 

•	For Android:
```
npx cap open android
```
Then use Android Studio to run on an emulator or device. 

7.	Run on the actual device or emulator: Use the IDE to launch the app on a smartphone emulator or connect the real phone.

Summary:

•	To just use the app: Open its URL on your phone browser or add to home screen.

•	To install natively from GitHub repo: Clone -> install deps -> add Capacitor -> configure -> build -> sync -> open in IDE -> run on device. 
