import project_img1 from "./assets/images/Backup-App.png";
import project_img2 from "./assets/images/weather-app.png";

const logotext = "MT";
const meta = {
  title: "Mihir Thakker",
  description:
    "I am Mihir Thakker, an ITSM, DevOps and TechOps specialist who currently lives in Reading, United Kingdom",
};

const introdata = {
  title: "Mihir Thakker",
  // animated text right under name
  animated: {
    first: "Full-Stack Developer",
    second: "Entrepreneur",
    third: "Web and App Designer",
  },
  description:
    "Senior Operations Engineer living in Reading, United Kingdom 🇬🇧",
};

const dataabout = {
  title: "More about myself",
  aboutme:
    "Dynamic IT professional with 3+ years experience in IT Project Management, IT Service Management and DevOps. I spend my free time developing websites, mobile apps and study business management.",
};
const worktimeline = [
  {
    jobtitle: "Senior Operations Engineer",
    where: "Automation Consultants",
    date: "Oct 2024 - present",
  },
  {
    jobtitle: "Technical Operations Engineer",
    where: "Automation Consultants",
    date: "Oct 2023 - Sep 2024",
  },
  {
    jobtitle: "Operations Engineer",
    where: "Automation Consultants",
    date: "Sep 2021 - Sep 2023",
  },
];

const skills = [
  {
    name: "HTML and CSS",
    value: 95,
  },
  {
    name: "MySQL",
    value: 90,
  },
  {
    name: "Python",
    value: 85,
  },
  {
    name: "JavaScript",
    value: 80,
  },
  {
    name: "React",
    value: 80,
  },
  {
    name: "PHP",
    value: 75,
  },
  {
    name: "Java",
    value: 60,
  },
  {
    name: "Swift",
    value: 50,
  },
];

const services = [
  {
    title: "Web Development 👨‍💻",
    description:
      "With a solid foundation in React, I have successfully built websites. I am continuously enhancing my skills to create even more innovative products.",
  },
  {
    title: "Mobile Apps 📲",
    description:
      "With a foundational knowledge of Swift and Flutter, I aspire to develop my own mobile app in the near future.",
  },
];

const dataportfolio = [
  {
    img: project_img1,
    description: "A simple app to manage your backups.",
    link: "https://github.com/mihir13/backup-app",
  },
  {
    img: project_img2,
    description:
      "A simple app to check the weather around you.",
    link: "https://github.com/mihir13/WeatherApp",
  }
];

const contactConfig = {
  YOUR_EMAIL: "mihirt132@gmail.com",
  description:
    "If you ever want to grab a coffee or just want to network - follow me on social media or just message me through the form!",
  // create an emailjs.com account
  // check out this tutorial https://www.emailjs.com/docs/examples/reactjs/
  YOUR_SERVICE_ID: "service_j31adlm",
  YOUR_TEMPLATE_ID: "template_zse9x0m",
  YOUR_USER_ID: "z73Wi4qeSQcXaq8ax",
};

const socialprofils = {
  linkedin: "https://www.linkedin.com/in/mihir-thakker-265ba8164/",
  github: "https://github.com/mihir13/",
  instagram: "https://instagram.com/mihirt_",
  twitter: "https://x.com/mihirr_",
  youtube: "https://www.youtube.com/@mihirt13",
};
export {
  meta,
  dataabout,
  dataportfolio,
  worktimeline,
  skills,
  services,
  introdata,
  contactConfig,
  socialprofils,
  logotext,
};
