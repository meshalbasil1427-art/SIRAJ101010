(()=>{
    "use strict";

    // ═══════════════════════════════════════════════════════════
    // CONFIG
    // ═══════════════════════════════════════════════════════════
    const MAX_SKILL_LEVEL = 5;
    const MIN_SKILL_LEVEL = 1;
    const CUSTOM_SKILL_PREFIX = "custom:";
    const STORAGE_KEY_PROFILE = "siraj_profile_v5";
    const STORAGE_KEY_REPORTS = "siraj_reports_v5";

    // Claude AI API — عبر Vercel Serverless Function (آمن)
    const AI_ENDPOINT = "/api/chat";

    const $ = id => document.getElementById(id);
    const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
    const round = n => Math.round(n);
    const nowISO = () => new Date().toISOString();
    const uid = () => "r_"+Math.random().toString(16).slice(2)+"_"+Date.now().toString(16);
    const escHtml = s => { const d=document.createElement("div"); d.textContent=String(s); return d.innerHTML; };

    const store = {
      get(k,fb){ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):fb; }catch{return fb;} },
      set(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch{} }
    };

    // ═══════════════════════════════════
    // SKILLS DB (30 مهارة)
    // ═══════════════════════════════════
    const SKILLS={sql:{ar:"SQL",en:"SQL"},excel:{ar:"Excel",en:"Excel"},powerbi:{ar:"Power BI",en:"Power BI"},python:{ar:"Python",en:"Python"},statistics:{ar:"الإحصاء",en:"Statistics"},ml:{ar:"تعلم الآلة",en:"Machine Learning"},data_viz:{ar:"تصوير البيانات",en:"Data Visualization"},data_modeling:{ar:"نمذجة البيانات",en:"Data Modeling"},etl:{ar:"ETL",en:"ETL"},cloud:{ar:"الحوسبة السحابية",en:"Cloud"},aws:{ar:"AWS",en:"AWS"},azure:{ar:"Azure",en:"Azure"},gcp:{ar:"GCP",en:"GCP"},cybersecurity:{ar:"الأمن السيبراني",en:"Cybersecurity"},networking:{ar:"الشبكات",en:"Networking"},linux:{ar:"Linux",en:"Linux"},devops:{ar:"DevOps",en:"DevOps"},git:{ar:"Git",en:"Git"},api:{ar:"واجهات API",en:"APIs"},requirements:{ar:"تحليل المتطلبات",en:"Requirements"},process:{ar:"تحسين العمليات",en:"Process Improvement"},stakeholder:{ar:"إدارة أصحاب المصلحة",en:"Stakeholder Mgmt"},communication:{ar:"التواصل",en:"Communication"},presentation:{ar:"العرض والتقديم",en:"Presentation"},product:{ar:"إدارة المنتج",en:"Product Management"},ux:{ar:"تجربة المستخدم UX",en:"UX"},erp:{ar:"ERP",en:"ERP"},sap:{ar:"SAP",en:"SAP"},agile:{ar:"Agile/Scrum",en:"Agile/Scrum"},testing:{ar:"اختبار البرمجيات",en:"Testing"},coding:{ar:"البرمجة",en:"Programming"}};

    // ═══════════════════════════════════
    // SKILL ALIASES (Smart Recognition)
    // ═══════════════════════════════════
    const SKILL_ALIASES={sql:["sql","إس كيو إل","قواعد بيانات","قواعد البيانات","database","databases","mysql","postgresql","postgres","oracle db","mariadb"],excel:["excel","إكسل","اكسل","جداول","spreadsheet","google sheets","جوجل شيت"],powerbi:["power bi","powerbi","بوربي","لوحات المعلومات","dashboard","داشبورد","tableau","تابلو","looker","لوكر","qlik"],python:["python","بايثون","بيثون"],statistics:["statistics","إحصاء","الإحصاء","احصاء","تحليل إحصائي","spss","stata","r language"],ml:["machine learning","تعلم آلة","تعلم الآلة","ذكاء اصطناعي","الذكاء الاصطناعي","ai","artificial intelligence","deep learning","تعلم عميق","nlp"],data_viz:["data visualization","تصوير البيانات","تحليل بيانات","تحليل البيانات","data analysis","data analytics"],data_modeling:["data modeling","نمذجة بيانات","نمذجة البيانات","er diagram"],etl:["etl","extract transform load","تكامل البيانات","data pipeline","data warehouse","مستودع بيانات","airflow"],cloud:["cloud","سحابة","الحوسبة السحابية","cloud computing"],aws:["aws","amazon web services"],azure:["azure","أزور","microsoft azure"],gcp:["gcp","google cloud","جوجل كلاود"],cybersecurity:["cybersecurity","أمن سيبراني","الأمن السيبراني","أمن المعلومات","information security","soc","penetration testing","اختبار اختراق"],networking:["networking","شبكات","الشبكات","ccna","tcp/ip"],linux:["linux","لينكس","ubuntu","centos","redhat","bash"],devops:["devops","ديف أوبس","ci/cd","docker","دوكر","kubernetes","k8s","terraform","ansible","jenkins"],git:["git","جت","جيت","github","جت هب","gitlab","version control"],api:["api","apis","واجهات api","واجهات برمجية","rest","restful","graphql","microservices"],requirements:["requirements","تحليل متطلبات","تحليل المتطلبات","جمع المتطلبات","brd","srs","user stories","قصص المستخدم"],process:["process improvement","تحسين عمليات","تحسين العمليات","bpmn","lean","six sigma","عمليات"],stakeholder:["stakeholder","أصحاب المصلحة","إدارة أصحاب المصلحة","stakeholder management"],communication:["communication","تواصل","التواصل","مهارات التواصل","soft skills","مهارات ناعمة"],presentation:["presentation","عرض","تقديم","العرض والتقديم","public speaking"],product:["product management","إدارة منتج","إدارة المنتج","product owner","roadmap"],ux:["ux","ui","ui/ux","تجربة مستخدم","تجربة المستخدم","user experience","figma","فيجما","adobe xd","wireframe","prototype"],erp:["erp","تخطيط موارد المؤسسة","enterprise resource planning"],sap:["sap","ساب","sap hana","sap s/4hana"],agile:["agile","أجايل","scrum","سكرم","kanban","كانبان","sprint","jira","جيرا"],testing:["testing","اختبار","اختبار برمجيات","qa","quality assurance","ضمان الجودة","selenium"],coding:["coding","programming","برمجة","البرمجة","تطوير برمجيات","javascript","java","c++","c#","react","node","php","html","css","frontend","backend","full stack"]};

    // ═══════════════════════════════════
    // MARKET DATA 🇸🇦 (مصادر: Glassdoor, ERI SalaryExpert, PayScale, GulfTalent 2025-2026)
    // آخر تحديث: مارس 2026
    // ═══════════════════════════════════
    const MARKET_DATA={
      data_analyst:{salaryRange:"7,000 – 16,500",avgSalary:"14,500",demand:"عالي جداً",vision:"برنامج التحول الوطني (الرقمنة)",openings:"~2,400",source:"Glassdoor/ERI 2026",growth:"+15% سنوياً"},
      data_scientist:{salaryRange:"12,000 – 28,000",avgSalary:"20,000",demand:"عالي جداً",vision:"SDAIA + برنامج التحول الوطني",openings:"~1,500",source:"ERI SalaryExpert 2026",growth:"+22% سنوياً"},
      business_analyst:{salaryRange:"9,000 – 18,000",avgSalary:"13,500",demand:"عالي",vision:"برنامج تنمية القدرات البشرية",openings:"~1,800",source:"GulfTalent 2025",growth:"+10% سنوياً"},
      cyber_analyst:{salaryRange:"10,000 – 22,600",avgSalary:"16,000",demand:"عالي جداً",vision:"الهيئة الوطنية للأمن السيبراني (NCA)",openings:"~3,000",source:"PayScale/Glassdoor 2026",growth:"+12.8% سنوياً"},
      cloud_engineer:{salaryRange:"12,000 – 28,000",avgSalary:"19,000",demand:"عالي",vision:"استراتيجية الحوسبة السحابية + مراكز بيانات Google/Oracle",openings:"~1,500",source:"GulfTalent 2025",growth:"+18% سنوياً"},
      product_manager:{salaryRange:"14,000 – 30,000",avgSalary:"22,000",demand:"متوسط-عالي",vision:"برنامج تنمية القدرات البشرية",openings:"~800",source:"Glassdoor 2025",growth:"+12% سنوياً"},
      ux_designer:{salaryRange:"8,000 – 18,000",avgSalary:"12,000",demand:"متوسط",vision:"برنامج جودة الحياة + التحول الرقمي الحكومي",openings:"~600",source:"GulfTalent 2025",growth:"+14% سنوياً"},
      erp_consultant:{salaryRange:"12,000 – 26,000",avgSalary:"18,000",demand:"عالي",vision:"برنامج التحول الوطني",openings:"~900",source:"ERI SalaryExpert 2025",growth:"+8% سنوياً"},
      devops_engineer:{salaryRange:"13,000 – 30,000",avgSalary:"20,000",demand:"عالي",vision:"استراتيجية الحوسبة السحابية",openings:"~1,100",source:"GulfTalent/Glassdoor 2025",growth:"+20% سنوياً"},
      software_engineer:{salaryRange:"9,000 – 22,000",avgSalary:"14,000",demand:"عالي جداً",vision:"NEOM + برنامج التحول الوطني",openings:"~4,000+",source:"GulfTalent IT Salary Guide 2025",growth:"+15% سنوياً"}
    };

    // ═══════════════════════════════════
    // RESOURCES 📚
    // ═══════════════════════════════════
    const RESOURCES={sql:[{name:"دورة SQL — منصة سطر",url:"https://satr.codes"},{name:"SQL for Data Science — Coursera",url:"https://coursera.org"}],python:[{name:"دورة بايثون — منصة سطر",url:"https://satr.codes"},{name:"Python for Everybody — Coursera",url:"https://coursera.org"}],excel:[{name:"Excel Skills — Coursera",url:"https://coursera.org"}],powerbi:[{name:"Power BI — Microsoft Learn",url:"https://learn.microsoft.com"}],statistics:[{name:"الإحصاء — Khan Academy",url:"https://khanacademy.org"}],ml:[{name:"Machine Learning — Andrew Ng",url:"https://coursera.org"}],cybersecurity:[{name:"الأمن السيبراني — سطر",url:"https://satr.codes"}],cloud:[{name:"AWS Cloud Practitioner",url:"https://aws.amazon.com/training"}],devops:[{name:"DevOps — منصة سطر",url:"https://satr.codes"}],git:[{name:"Git & GitHub — سطر",url:"https://satr.codes"}],requirements:[{name:"Business Analysis — IIBA",url:"https://iiba.org"}],communication:[{name:"مهارات التواصل — إدراك",url:"https://edraak.org"}],coding:[{name:"البرمجة — منصة سطر",url:"https://satr.codes"},{name:"CS50 — Harvard",url:"https://cs50.harvard.edu"}],default:[{name:"منصة سطر",url:"https://satr.codes"},{name:"Coursera",url:"https://coursera.org"}]};

    // ═══════════════════════════════════
    // PROJECTS DB 💼
    // ═══════════════════════════════════
    const PROJECTS_DB={data_analyst:[{title:"لوحة تحليل بيانات سوق العقار السعودي",objective:"بناء Dashboard تفاعلي بـ Power BI يحلل أسعار العقار في 5 مدن سعودية",skills:["powerbi","sql","data_viz"],deliverables:["Dashboard تفاعلي","تقرير PDF","كود SQL"]},{title:"تحليل بيانات التوظيف من منصة جدارات",objective:"تحليل أنماط التوظيف والمهارات المطلوبة في السوق السعودي",skills:["excel","statistics","data_viz"],deliverables:["تقرير تحليلي","رسوم بيانية","توصيات"]}],data_scientist:[{title:"نموذج تنبؤ أسعار العقار في الرياض",objective:"بناء ML Model يتنبأ بأسعار العقارات باستخدام بيانات حقيقية",skills:["python","ml","statistics"],deliverables:["Notebook","Model","تقرير"]}],business_analyst:[{title:"تحسين عملية التوظيف في جهة حكومية",objective:"توثيق العمليات الحالية واقتراح تحسينات باستخدام BPMN",skills:["requirements","process","stakeholder"],deliverables:["Process Map","تقرير التحسين","خطة التنفيذ"]}],cyber_analyst:[{title:"محاكاة SOC وتحليل حوادث أمنية",objective:"بناء بيئة SOC مصغرة وتحليل سيناريوهات هجوم",skills:["cybersecurity","networking","linux"],deliverables:["تقرير الحوادث","Playbook","Dashboard"]}],cloud_engineer:[{title:"بناء بنية سحابية آمنة على AWS",objective:"تصميم وتنفيذ بنية 3-tier على AWS مع أمان متكامل",skills:["cloud","aws","devops"],deliverables:["Architecture Diagram","IaC Code","تقرير الأمان"]}],product_manager:[{title:"تصميم منتج رقمي لخدمة التوصيل السعودية",objective:"بناء PRD كامل مع user research",skills:["product","stakeholder","agile"],deliverables:["PRD","Roadmap","Wireframes"]}],ux_designer:[{title:"إعادة تصميم تجربة تطبيق حكومي",objective:"بحث مستخدم + تصميم واجهات محسّنة",skills:["ux","communication","presentation"],deliverables:["Research Report","Wireframes","Prototype"]}],erp_consultant:[{title:"توثيق عمليات شركة تجزئة على SAP",objective:"رسم العمليات الحالية ومطابقتها مع SAP",skills:["erp","process","requirements"],deliverables:["Process Map","Gap Analysis","خطة التنفيذ"]}],devops_engineer:[{title:"بناء CI/CD Pipeline كامل",objective:"أتمتة النشر باستخدام GitHub Actions + Docker",skills:["devops","git","cloud"],deliverables:["Pipeline Config","Documentation"]}],software_engineer:[{title:"بناء API لنظام إدارة المهام",objective:"تطوير RESTful API مع اختبارات",skills:["coding","api","testing"],deliverables:["API Code","Tests","Documentation"]}]};

    // ═══════════════════════════════════
    // CERT MATCHING
    // ═══════════════════════════════════
    const CERT_ALIASES={"google data analytics":["google data analytics","شهادة قوقل","شهادة جوجل تحليل بيانات","gda"],"ibm data analyst":["ibm data analyst","ibm data"],"comptia security+":["comptia security","security+","sec+"],"ceh":["ceh","certified ethical hacker"],"aws ccp":["aws ccp","aws cloud practitioner","cloud practitioner"],"aws saa":["aws saa","aws solutions architect"],"az-900":["az-900","az900","azure fundamentals"],"google ux design":["google ux","google ux design"],"sap certified":["sap certified","sap","شهادة ساب"],"pmp":["pmp","project management professional"]};

    // ═══════════════════════════════════
    // TOOL→SKILL MAP
    // ═══════════════════════════════════
    const TOOL_SKILL_MAP={"power bi":"powerbi","powerbi":"powerbi","tableau":"powerbi","excel":"excel","إكسل":"excel","python":"python","بايثون":"python","jupyter":"python","sql":"sql","mysql":"sql","postgresql":"sql","git":"git","github":"git","gitlab":"git","jira":"agile","figma":"ux","docker":"devops","kubernetes":"devops","jenkins":"devops","terraform":"devops","aws":"aws","azure":"azure","gcp":"gcp","linux":"linux","sap":"sap","postman":"api","selenium":"testing","spss":"statistics","wireshark":"networking","nmap":"cybersecurity"};

    // ═══════════════════════════════════
    // ROLES (10 وظائف)
    // ═══════════════════════════════════
    const ROLES=[
      {id:"data_analyst",ar:"محلل بيانات",en:"Data Analyst",descAr:"تحليل البيانات وبناء لوحات وقراءات تنفيذية.",tools:["sql","excel","powerbi"],required:[{skill:"sql",level:4,weight:10},{skill:"excel",level:4,weight:7},{skill:"powerbi",level:4,weight:9},{skill:"statistics",level:3,weight:6},{skill:"data_viz",level:4,weight:6},{skill:"communication",level:3,weight:5},{skill:"presentation",level:3,weight:4}],optional:[{skill:"python",level:2,weight:3},{skill:"data_modeling",level:2,weight:3}],certBonus:["google data analytics","ibm data analyst"]},
      {id:"data_scientist",ar:"عالم بيانات",en:"Data Scientist",descAr:"نمذجة تنبؤية وتحليلات متقدمة.",tools:["python","sql","git"],required:[{skill:"python",level:4,weight:10},{skill:"statistics",level:4,weight:9},{skill:"ml",level:4,weight:10},{skill:"sql",level:3,weight:6},{skill:"etl",level:3,weight:6},{skill:"git",level:3,weight:4},{skill:"communication",level:3,weight:5}],optional:[{skill:"cloud",level:2,weight:4}],certBonus:["ibm data analyst"]},
      {id:"business_analyst",ar:"محلل أعمال",en:"Business Analyst",descAr:"تحليل متطلبات وربط التقنية بالعمل.",tools:["excel","agile"],required:[{skill:"requirements",level:4,weight:10},{skill:"process",level:4,weight:8},{skill:"stakeholder",level:4,weight:8},{skill:"communication",level:4,weight:8},{skill:"presentation",level:3,weight:5},{skill:"agile",level:3,weight:5},{skill:"excel",level:3,weight:4}],optional:[{skill:"sql",level:2,weight:3}],certBonus:["pmp"]},
      {id:"cyber_analyst",ar:"محلل أمن سيبراني",en:"Cyber Analyst",descAr:"مراقبة التهديدات، SOC، وتحليل الحوادث.",tools:["linux","networking"],required:[{skill:"cybersecurity",level:4,weight:10},{skill:"networking",level:4,weight:8},{skill:"linux",level:3,weight:6},{skill:"communication",level:3,weight:5},{skill:"process",level:3,weight:4}],optional:[{skill:"cloud",level:2,weight:4}],certBonus:["comptia security+","ceh"]},
      {id:"cloud_engineer",ar:"مهندس سحابة",en:"Cloud Engineer",descAr:"بناء وتشغيل البنية السحابية والأمان.",tools:["aws","azure","linux"],required:[{skill:"cloud",level:4,weight:10},{skill:"linux",level:3,weight:6},{skill:"networking",level:3,weight:6},{skill:"devops",level:3,weight:6},{skill:"git",level:3,weight:4},{skill:"cybersecurity",level:3,weight:5}],optional:[{skill:"aws",level:3,weight:4}],certBonus:["aws ccp","aws saa","az-900"]},
      {id:"product_manager",ar:"مدير منتج",en:"Product Manager",descAr:"تعريف الرؤية والأولويات وقيادة التنفيذ.",tools:["agile","data_viz"],required:[{skill:"product",level:4,weight:10},{skill:"stakeholder",level:4,weight:8},{skill:"communication",level:4,weight:8},{skill:"presentation",level:4,weight:7},{skill:"process",level:3,weight:5},{skill:"agile",level:3,weight:5}],optional:[{skill:"data_viz",level:2,weight:3}],certBonus:["pmp"]},
      {id:"ux_designer",ar:"مصمم UX",en:"UX Designer",descAr:"بحث مستخدم + تصميم تدفقات + نماذج.",tools:["ux"],required:[{skill:"ux",level:4,weight:10},{skill:"communication",level:4,weight:7},{skill:"presentation",level:3,weight:5},{skill:"process",level:3,weight:4}],optional:[{skill:"product",level:2,weight:3}],certBonus:["google ux design"]},
      {id:"erp_consultant",ar:"استشاري ERP",en:"ERP Consultant",descAr:"تطبيق ERP وربط العمليات والمتطلبات.",tools:["erp","sap"],required:[{skill:"erp",level:4,weight:10},{skill:"process",level:4,weight:8},{skill:"requirements",level:4,weight:8},{skill:"communication",level:4,weight:7},{skill:"stakeholder",level:3,weight:5}],optional:[{skill:"sap",level:3,weight:4}],certBonus:["sap certified"]},
      {id:"devops_engineer",ar:"مهندس DevOps",en:"DevOps Engineer",descAr:"CI/CD، أتمتة، تشغيل، مراقبة.",tools:["devops","linux","git"],required:[{skill:"devops",level:4,weight:10},{skill:"linux",level:4,weight:7},{skill:"git",level:4,weight:6},{skill:"cloud",level:3,weight:6},{skill:"networking",level:3,weight:5},{skill:"cybersecurity",level:3,weight:4}],optional:[{skill:"api",level:2,weight:3}],certBonus:["aws ccp"]},
      {id:"software_engineer",ar:"مهندس برمجيات",en:"Software Engineer",descAr:"تطوير منتجات برمجية، هندسة، اختبار.",tools:["git","api","testing"],required:[{skill:"coding",level:4,weight:10},{skill:"git",level:3,weight:6},{skill:"api",level:3,weight:6},{skill:"testing",level:3,weight:6},{skill:"communication",level:3,weight:4}],optional:[{skill:"cloud",level:2,weight:3}],certBonus:[]}
    ];

    // ═══════════════════════════════════
    // INTERVIEW QUESTIONS (مقابلة تجريبية)
    // ═══════════════════════════════════
    const INTERVIEW_DB={data_analyst:["كيف تتعامل مع البيانات المفقودة (Missing Data)؟","ما الفرق بين INNER JOIN و LEFT JOIN؟","كيف تبني Dashboard يخدم الإدارة التنفيذية؟","ما هو الفرق بين المتوسط والوسيط ومتى تستخدم كل منهما؟"],data_scientist:["اشرح الفرق بين Overfitting و Underfitting؟","متى تستخدم Random Forest بدل Linear Regression؟","كيف تتعامل مع Dataset غير متوازن؟"],business_analyst:["كيف تجمع المتطلبات من أصحاب المصلحة المتضاربين؟","ما الفرق بين الـ Functional و Non-functional Requirements؟","اشرح تجربة حللت فيها عملية وحسنتها."],cyber_analyst:["ما الفرق بين IDS و IPS؟","كيف تتعامل مع حادثة أمنية حقيقية؟","اشرح مفهوم الـ Zero Trust."],default:["اشرح أكبر تحدي تقني واجهته وكيف حليته؟","كيف تطور مهاراتك بشكل مستمر؟","لماذا اخترت هذا المجال تحديداً؟","أعطني مثال على مشروع فريق عملت عليه وما كان دورك؟"]};

    // ═══════════════════════════════════
    // SKILL RECOGNITION
    // ═══════════════════════════════════
    function normalizeSkillName(raw){
      const s=String(raw||"").trim().toLowerCase().replace(/[^\p{L}\p{N}\s\/.\-+#]/gu," ").replace(/\s+/g," ").trim();
      if(!s) return null;
      for(const [k,m] of Object.entries(SKILLS)){if(s===m.ar.toLowerCase()||s===m.en.toLowerCase()) return k;}
      for(const [k,aliases] of Object.entries(SKILL_ALIASES)){for(const alias of aliases){if(s===alias||s.includes(alias)||alias.includes(s)) return k;}}
      return CUSTOM_SKILL_PREFIX+s.slice(0,40);
    }
    function skillLabel(k){if(k.startsWith(CUSTOM_SKILL_PREFIX)) return k.replace(CUSTOM_SKILL_PREFIX,""); const m=SKILLS[k]; return m?m.ar:k;}

    function findClosestSkill(input){
      let best=null,bestScore=0;
      for(const [key,aliases] of Object.entries(SKILL_ALIASES)){
        for(const alias of aliases){
          const words=input.split(/\s+/);
          let overlap=0;
          for(const w of words){if(w.length>2&&alias.includes(w)) overlap++;}
          if(overlap>bestScore){bestScore=overlap;best=SKILLS[key]?SKILLS[key].ar:key;}
        }
      }
      return bestScore>0?best:null;
    }

    // ═══════════════════════════════════
    // STATE
    // ═══════════════════════════════════
    const state={
      tab:"profile",selectedRoleId:null,completedSteps:new Set(),currentEvidenceSkill:null,
      profile:{major:"",eduLevel:"UNI",experienceYears:0,prefs:"balanced",sector:"quasi",certs:[],tools:[],skills:[],evidence:{}},
      analysis:null,reportId:null,lastReport:null,interviewIdx:0
    };

    const dom={};
    function cacheDom(){
      dom.tabs=document.querySelectorAll(".tab");dom.steps=document.querySelectorAll(".step");
      dom.views={profile:$("viewProfile"),roles:$("viewRoles"),analysis:$("viewAnalysis"),report:$("viewReport")};
      dom.major=$("major");dom.eduLevel=$("eduLevel");dom.experienceYears=$("experienceYears");dom.prefs=$("prefs");dom.sector=$("sector");dom.certs=$("certs");dom.tools=$("tools");
      dom.skillName=$("skillName");dom.skillLevel=$("skillLevel");dom.skillsBody=$("skillsBody");dom.skillTable=$("skillTable");dom.skillsEmpty=$("skillsEmpty");
      dom.rolesGrid=$("rolesGrid");dom.scoreValue=$("scoreValue");dom.scoreBar=$("scoreBar");dom.roleValue=$("roleValue");dom.roleNote=$("roleNote");
      dom.confidenceValue=$("confidenceValue");dom.confidenceBar=$("confidenceBar");dom.confidenceNote=$("confidenceNote");
      dom.missingList=$("missingList");dom.roadmap=$("roadmap");dom.projects=$("projects");dom.barChart=$("barChart");dom.radarChart=$("radarChart");
      dom.reportSummary=$("reportSummary");dom.reportJson=$("reportJson");dom.dialog=$("dialog");dom.chatInput=$("chatInput");dom.toast=$("toast");dom.toastText=$("toastText");
      dom.estimateBadge=$("estimateBadge");dom.estimateText=$("estimateText");dom.comparePanel=$("comparePanel");dom.compareResult=$("compareResult");dom.compare1=$("compare1");dom.compare2=$("compare2");
    }

    let toastTimer;
    function toast(t){dom.toastText.textContent=t;dom.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>dom.toast.classList.remove("show"),2200);}

    // ═══════════════════════════════════
    // TAB/STEP NAVIGATION
    // ═══════════════════════════════════
    function setTab(tab){
      state.tab=tab;
      dom.tabs.forEach(t=>{t.classList.toggle("active",t.dataset.tab===tab);});
      Object.entries(dom.views).forEach(([k,el])=>{el.style.display=k===tab?"block":"none";});
      const order=["profile","roles","analysis","report"];const idx=order.indexOf(tab);
      dom.steps.forEach((s,i)=>{s.classList.toggle("active",i===idx);s.classList.toggle("done",state.completedSteps.has(order[i])&&i!==idx);});
      if(tab==="analysis"&&state.analysis){requestAnimationFrame(()=>setTimeout(()=>{drawBarChart(dom.barChart,state.analysis.res.charts);drawRadarChart(dom.radarChart,state.analysis.res.charts);},80));}
    }

    // ═══════════════════════════════════
    // PROFILE CRUD
    // ═══════════════════════════════════
    function profileFromInputs(){
      state.profile.major=dom.major.value.trim();state.profile.eduLevel=dom.eduLevel.value;
      state.profile.experienceYears=clamp(Number(dom.experienceYears.value||0),0,50);
      state.profile.prefs=dom.prefs.value;state.profile.sector=dom.sector.value||"quasi";
      state.profile.certs=dom.certs.value.split(",").map(s=>s.trim()).filter(Boolean);
      state.profile.tools=dom.tools.value.split(",").map(s=>s.trim()).filter(Boolean);
    }
    function loadProfileToInputs(){
      dom.major.value=state.profile.major||"";dom.eduLevel.value=state.profile.eduLevel||"UNI";
      dom.experienceYears.value=String(state.profile.experienceYears||0);dom.prefs.value=state.profile.prefs||"balanced";
      dom.sector.value=state.profile.sector||"quasi";dom.certs.value=(state.profile.certs||[]).join(", ");dom.tools.value=(state.profile.tools||[]).join(", ");
    }
    function validateProfile(){
      profileFromInputs();let valid=true;
      if(state.profile.major.length<2){$("fieldMajor").classList.add("has-error");valid=false;}else{$("fieldMajor").classList.remove("has-error");}
      if((state.profile.skills||[]).length===0) valid=false;
      return valid;
    }
    function saveProfile(){profileFromInputs();store.set(STORAGE_KEY_PROFILE,state.profile);state.completedSteps.add("profile");toast("تم الحفظ");}
    function loadProfile(){const p=store.get(STORAGE_KEY_PROFILE,null);if(p) state.profile={...state.profile,...p,evidence:p.evidence||{}};loadProfileToInputs();renderSkillsTable();}
    function resetProfile(){
      if(!confirm("هل أنت متأكد من تصفير كل البيانات؟")) return;
      state.profile={major:"",eduLevel:"UNI",experienceYears:0,prefs:"balanced",sector:"quasi",certs:[],tools:[],skills:[],evidence:{}};
      loadProfileToInputs();renderSkillsTable();store.set(STORAGE_KEY_PROFILE,state.profile);toast("تم التصفير");
    }

    // ═══════════════════════════════════
    // SKILLS MANAGEMENT
    // ═══════════════════════════════════
    function addSkill(raw,level){
      const key=normalizeSkillName(raw);
      if(!key||String(raw||"").trim().length<2){toast("اسم المهارة غير صالح");return;}
      const lvl=clamp(Number(level||3),MIN_SKILL_LEVEL,MAX_SKILL_LEVEL);
      const idx=state.profile.skills.findIndex(s=>s.key===key);
      if(idx>=0){state.profile.skills[idx].level=Math.max(state.profile.skills[idx].level,lvl);state.profile.skills[idx].raw=raw;}
      else{state.profile.skills.push({raw:raw.trim(),key,level:lvl});}
      if(key.startsWith(CUSTOM_SKILL_PREFIX)){
        const suggestion=findClosestSkill(raw.trim().toLowerCase());
        toast(suggestion?`"${raw}" غير معروفة — هل تقصد "${suggestion}"؟`:`"${raw}" غير معروفة — جرب اسم آخر`);
      }
      renderSkillsTable();store.set(STORAGE_KEY_PROFILE,state.profile);
    }
    function removeSkill(key){state.profile.skills=state.profile.skills.filter(s=>s.key!==key);if(state.profile.evidence?.[key]) delete state.profile.evidence[key];renderSkillsTable();store.set(STORAGE_KEY_PROFILE,state.profile);}
    function setSkillLevel(key,level){const s=state.profile.skills.find(x=>x.key===key);if(s) s.level=clamp(Number(level),MIN_SKILL_LEVEL,MAX_SKILL_LEVEL);store.set(STORAGE_KEY_PROFILE,state.profile);}

    function renderSkillsTable(){
      const tb=dom.skillsBody;tb.innerHTML="";
      const sk=[...(state.profile.skills||[])].sort((a,b)=>skillLabel(a.key).localeCompare(skillLabel(b.key)));
      dom.skillTable.style.display=sk.length?"table":"none";dom.skillsEmpty.style.display=sk.length?"none":"block";
      for(const s of sk){
        const tr=document.createElement("tr");
        const tdN=document.createElement("td");const pill=document.createElement("span");pill.className=s.key.startsWith(CUSTOM_SKILL_PREFIX)?"pill pill-warn":"pill";pill.textContent=s.raw||skillLabel(s.key);tdN.appendChild(pill);
        const tdNorm=document.createElement("td");tdNorm.style.cssText="color:var(--muted);font-size:12px";
        tdNorm.textContent=s.key.startsWith(CUSTOM_SKILL_PREFIX)?"غير معروفة":skillLabel(s.key);
        const tdL=document.createElement("td");const rng=document.createElement("input");rng.type="range";rng.min="1";rng.max="5";rng.value=String(s.level);
        const sp=document.createElement("span");sp.style.cssText="font-weight:800;margin-inline-start:8px";sp.textContent=String(s.level);
        rng.addEventListener("input",()=>{sp.textContent=rng.value;setSkillLevel(s.key,rng.value);});
        tdL.appendChild(rng);tdL.appendChild(sp);
        const tdR=document.createElement("td");const xBtn=document.createElement("span");xBtn.className="x";xBtn.textContent="✕";xBtn.addEventListener("click",()=>removeSkill(s.key));tdR.appendChild(xBtn);
        tr.append(tdN,tdNorm,tdL,tdR);tb.appendChild(tr);
      }
    }

    // ═══════════════════════════════════
    // ROLES RENDERING
    // ═══════════════════════════════════
    function renderRoles(){
      dom.rolesGrid.innerHTML="";
      for(const r of ROLES){
        const mkt=MARKET_DATA[r.id]||{};
        const div=document.createElement("div");
        div.className="role-card"+(state.selectedRoleId===r.id?" active":"");
        div.innerHTML=`<h3>${escHtml(r.ar)}</h3><div class="desc">${escHtml(r.descAr)}</div>`+
          `<div class="role-meta">${(r.tools||[]).slice(0,4).map(k=>`<span class="tag">${escHtml(skillLabel(k))}</span>`).join("")}</div>`+
          (mkt.salaryRange?`<div class="market-info"><span>${escHtml(mkt.salaryRange)} ر.س/شهر · الطلب: ${escHtml(mkt.demand)}</span></div>`:"");
        div.addEventListener("click",()=>{state.selectedRoleId=r.id;renderRoles();saySiraj("siraj",`اخترت: ${r.ar}. اضغط "حلّل الجاهزية" لنبدأ التحليل.`);});
        dom.rolesGrid.appendChild(div);
      }
      [dom.compare1,dom.compare2].forEach((sel,si)=>{sel.innerHTML="";ROLES.forEach((r,i)=>{const o=document.createElement("option");o.value=r.id;o.textContent=r.ar;if(si===1&&i===1) o.selected=true;sel.appendChild(o);});});
    }

    function autoPickBestRole(){
      if(!validateProfile()){toast("أكمل الملف أولاً");return;}
      const scores=ROLES.map(r=>({id:r.id,score:analyzeFallback(state.profile,r).score})).sort((a,b)=>b.score-a.score);
      state.selectedRoleId=scores[0]?.id||ROLES[0].id;renderRoles();toast("تم التحديد آلياً");
    }

    // ═══════════════════════════════════
    // SCORING ENGINE
    // ═══════════════════════════════════
    // ═══════════════════════════════════
    // SAUDI LENS — نظام توزين حسب القطاع السعودي
    // ═══════════════════════════════════
    // كل قطاع يقدّر مهارات مختلفة بأوزان مختلفة فعلياً
    const SAUDI_LENS = {
      gov: {
        label: "حكومي",
        // المهارات الإدارية والتواصل أهم بكثير في القطاع الحكومي
        skillMult: {
          requirements: 2.0, process: 1.8, stakeholder: 1.8, communication: 1.7,
          presentation: 1.6, agile: 1.3, erp: 1.5, sap: 1.5,
          // المهارات التقنية البحتة أقل أهمية
          coding: 0.6, devops: 0.5, api: 0.6, cloud: 0.7, git: 0.6,
          python: 0.7, ml: 0.6, cybersecurity: 1.2, networking: 1.0
        },
        // بونص إضافي لشهادات معينة
        certBoost: { "pmp": 5, "cbap": 4, "sap certified": 4 },
        // نصيحة القطاع
        tip: "القطاع الحكومي يركز على: إدارة أصحاب المصلحة، التواصل، وتحسين العمليات. الشهادات الإدارية (PMP, CBAP) لها وزن كبير.",
        salaryMult: 0.9,  // رواتب أقل قليلاً لكن أمان وظيفي أعلى
        demandNote: "الأمان الوظيفي عالي + بدلات + تأمين شامل"
      },
      quasi: {
        label: "شبه حكومي",
        // توازن بين التقني والإداري
        skillMult: {
          communication: 1.4, stakeholder: 1.3, process: 1.3, presentation: 1.2,
          requirements: 1.3, agile: 1.2,
          coding: 1.0, devops: 1.0, api: 1.0, cloud: 1.1, git: 1.0,
          python: 1.0, ml: 1.0, cybersecurity: 1.2,
          erp: 1.3, sap: 1.3, product: 1.2
        },
        certBoost: { "pmp": 3, "aws ccp": 3 },
        tip: "القطاع شبه الحكومي (أرامكو، سابك، STC) يطلب مزيج متوازن من المهارات التقنية والإدارية. التخصص التقني مع مهارات التواصل مطلوب.",
        salaryMult: 1.15,  // أعلى رواتب
        demandNote: "رواتب تنافسية + مسار وظيفي واضح"
      },
      private: {
        label: "خاص",
        // المهارات التقنية أهم بكثير في القطاع الخاص
        skillMult: {
          coding: 1.8, devops: 1.7, api: 1.6, cloud: 1.6, git: 1.5,
          python: 1.5, ml: 1.5, testing: 1.4, ux: 1.3,
          // المهارات الإدارية أقل (مطلوبة لكن ليست الأولوية)
          communication: 0.8, stakeholder: 0.7, process: 0.8, presentation: 0.7,
          requirements: 0.9, erp: 0.8, sap: 0.7,
          cybersecurity: 1.3, agile: 1.3, product: 1.2
        },
        certBoost: { "aws ccp": 5, "aws saa": 5, "az-900": 4, "google ux design": 3 },
        tip: "القطاع الخاص (Startups, شركات التقنية) يركز على: المهارات التقنية العملية، سرعة التنفيذ، والشهادات السحابية. GitHub portfolio مهم جداً.",
        salaryMult: 1.0,
        demandNote: "نمو سريع + فرص ترقية + بيئة مرنة"
      }
    };

    // الراتب يتغير حسب القطاع (مصدر: GulfTalent, Glassdoor, مقابلات سوق 2025-2026)
    const SECTOR_SALARY = {
      data_analyst:     { gov: "6,000 – 12,000", quasi: "9,000 – 18,000", private: "7,000 – 16,500" },
      data_scientist:   { gov: "10,000 – 18,000", quasi: "15,000 – 30,000", private: "12,000 – 28,000" },
      business_analyst: { gov: "8,000 – 14,000", quasi: "10,000 – 20,000", private: "9,000 – 18,000" },
      cyber_analyst:    { gov: "9,000 – 20,000", quasi: "12,000 – 26,000", private: "10,000 – 22,600" },
      cloud_engineer:   { gov: "10,000 – 18,000", quasi: "14,000 – 30,000", private: "12,000 – 28,000" },
      product_manager:  { gov: "11,000 – 20,000", quasi: "16,000 – 35,000", private: "14,000 – 30,000" },
      ux_designer:      { gov: "7,000 – 13,000", quasi: "9,000 – 20,000", private: "8,000 – 18,000" },
      erp_consultant:   { gov: "10,000 – 22,000", quasi: "14,000 – 30,000", private: "12,000 – 26,000" },
      devops_engineer:  { gov: "10,000 – 18,000", quasi: "15,000 – 32,000", private: "13,000 – 30,000" },
      software_engineer:{ gov: "8,000 – 15,000", quasi: "12,000 – 25,000", private: "9,000 – 22,000" }
    };

    function sectorWeightMult(sector,roleId,skillKey){
      const lens = SAUDI_LENS[sector] || SAUDI_LENS.quasi;
      return lens.skillMult[skillKey] || 1.0;
    }

    function calcSectorCertBoost(profile,sector){
      const lens = SAUDI_LENS[sector] || SAUDI_LENS.quasi;
      const userCerts = (profile.certs||[]).map(c=>c.toLowerCase().trim());
      let boost = 0;
      for(const [certKey, points] of Object.entries(lens.certBoost||{})){
        const aliases = CERT_ALIASES[certKey] || [certKey];
        for(const uc of userCerts){
          if(aliases.some(a=>uc.includes(a)||a.includes(uc))){ boost+=points; break; }
        }
      }
      return Math.min(10, boost);
    }

    // تحليل مقارن: يحسب النسبة لكل القطاعات الثلاثة
    function analyzeAllSectors(profile,role){
      const results = {};
      for(const sec of ["gov","quasi","private"]){
        const tempProfile = {...profile, sector: sec};
        const r = analyzeFallback(tempProfile, role);
        results[sec] = { score: r.score, label: SAUDI_LENS[sec].label };
      }
      return results;
    }

    function calcCertBonus(profile,role){
      const userCerts=(profile.certs||[]).map(c=>c.toLowerCase().trim()).filter(Boolean);
      const roleCerts=(role.certBonus||[]);
      if(!userCerts.length) return 0;
      let bonus=0;const matched=new Set();
      for(const rc of roleCerts){
        const aliases=CERT_ALIASES[rc]||[rc];
        for(const uc of userCerts){if(matched.has(uc)) continue;if(aliases.some(a=>uc.includes(a)||a.includes(uc))){bonus+=5;matched.add(uc);break;}}
      }
      const unmatched=userCerts.length-matched.size;
      if(unmatched>0) bonus+=Math.min(3,unmatched);
      return Math.min(15,bonus);
    }

    function calcToolBonus(profile,role){
      const userTools=(profile.tools||[]).map(t=>t.toLowerCase().trim()).filter(Boolean);
      if(!userTools.length) return 0;
      const reqSkills=new Set((role.required||[]).map(r=>r.skill));
      let bonus=0;const counted=new Set();
      for(const tool of userTools){
        let mapped=TOOL_SKILL_MAP[tool];
        if(!mapped){for(const [k,sk] of Object.entries(TOOL_SKILL_MAP)){if(tool.includes(k)||k.includes(tool)){mapped=sk;break;}}}
        if(mapped&&!counted.has(mapped)){counted.add(mapped);bonus+=reqSkills.has(mapped)?2:0.5;}
      }
      return Math.min(8,round(bonus));
    }

    function analyzeFallback(profile,role){
      const map=new Map();
      for(const s of profile.skills||[]){if(s.key) map.set(s.key,Math.max(map.get(s.key)||0,clamp(Number(s.level||1),1,5)));}

      const required=role.required||[];
      const reqWeights=required.map(x=>(x.weight||0)*sectorWeightMult(profile.sector||"quasi",role.id,x.skill));
      const totalReqWeight=reqWeights.reduce((a,x)=>a+x,0)||1;

      let wSumReq=0;
      const perSkill=required.map((req,idx)=>{
        const uLvl=map.get(req.skill)||0;const rLvl=clamp(req.level,1,5);
        const achieved=Math.min(1,uLvl/rLvl);const gap=Math.max(0,rLvl-uLvl);
        const w=reqWeights[idx]||0;const impact=w*gap;wSumReq+=w*achieved;
        return{skill:req.skill,reqLevel:rLvl,userLevel:Math.round(uLvl*10)/10,weight:w,achieved,gap,impact};
      });

      let baseScore=round(100*Math.min(1,wSumReq/totalReqWeight));
      const expBonus=Math.min(8,Math.floor((profile.experienceYears||0)*2));
      const certBonus=calcCertBonus(profile,role);
      const toolBonus=calcToolBonus(profile,role);
      const sectorCertBoost=calcSectorCertBoost(profile,profile.sector||"quasi");
      const score=clamp(baseScore+expBonus+certBonus+toolBonus+sectorCertBoost,0,100);
      const breakdown={base:baseScore,experience:expBonus,certs:certBonus,tools:toolBonus,sectorBoost:sectorCertBoost,total:score};

      const missing=perSkill.filter(x=>x.gap>0||x.achieved<0.75).sort((a,b)=>b.impact-a.impact)
        .map(x=>({skill:x.skill,label:skillLabel(x.skill),reqLevel:x.reqLevel,userLevel:x.userLevel,impact:round(x.impact*10)/10,evidence:profile.evidence?.[x.skill]||null}));

      const topReq=[...perSkill].sort((a,b)=>b.weight-a.weight).slice(0,7).map(x=>({key:x.skill,label:skillLabel(x.skill),req:x.reqLevel,user:Math.min(x.userLevel,5)}));

      const skillCount=(profile.skills||[]).length;
      const confBase=Math.min(95,40+skillCount*5+(profile.experienceYears>0?10:0)+(profile.certs.length>0?8:0)+((profile.tools||[]).length>0?5:0));
      const confNote=confBase>=80?"ثقة عالية — بيانات كافية":confBase>=60?"ثقة متوسطة — أضف مزيد من المهارات":"ثقة منخفضة — أضف مهارات وشهادات";

      const prefsMultiplier={fast:0.7,balanced:1,parttime:1.4};
      const rawWeeks=score>=90?0:score>=70?Math.ceil((100-score)/7):score>=50?Math.ceil((100-score)/5):Math.ceil((100-score)/4);
      const estWeeks=Math.max(0,round(rawWeeks*(prefsMultiplier[profile.prefs]||1)));

      const totalWeeks={fast:8,balanced:12,parttime:16}[profile.prefs]||12;
      const phases=["تأسيس","بناء","تطبيق","تعزيز"];
      const roadmap=[];
      const gapSkills=missing.slice(0,6);
      for(let w=1;w<=Math.min(totalWeeks,gapSkills.length>0?totalWeeks:4);w++){
        const phaseIdx=Math.min(3,Math.floor((w-1)/(totalWeeks/4)));
        const skillIdx=(w-1)%Math.max(1,gapSkills.length);
        const sk=gapSkills[skillIdx]||{label:"مراجعة عامة",skill:"general"};
        const res=RESOURCES[sk.skill]||RESOURCES.default;
        roadmap.push({week:w,phase:phases[phaseIdx],focus:[sk.label],tasks:[{title:w<=totalWeeks/3?"مراجعة الأساسيات والمفاهيم":w<=totalWeeks*2/3?"تطبيق عملي ومشروع مصغر":"مشروع متقدم وتحضير للمقابلات",resource:res[0]?.name||"منصة سطر"}]});
      }

      const roleProjects=(PROJECTS_DB[role.id]||[]).slice(0,3).map(p=>({...p,relevance:p.skills.filter(sk=>missing.some(m=>m.skill===sk)).length})).sort((a,b)=>b.relevance-a.relevance);

      return{score,breakdown,perSkill,missing,roadmap,projects:roleProjects.length?roleProjects:[{title:"مشروع تطبيقي عام",objective:"تطبيق المهارات المطلوبة عملياً",skills:[],deliverables:["تقرير","كود"]}],charts:topReq,estWeeks,confidence:{score:confBase,note:confNote}};
    }

    // ═══════════════════════════════════
    // AI INTEGRATION (Claude via Serverless)
    // ═══════════════════════════════════
    async function getAISummary(profile,role,result){
      try{
        const resp=await fetch(AI_ENDPOINT,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            mode:"summary",
            question:"",
            context:{major:profile.major,role:role.ar,score:result.score,sector:profile.sector,
              gaps:result.missing.slice(0,3).map(m=>m.label),estWeeks:result.estWeeks,
              experience:profile.experienceYears,certs:profile.certs}
          })
        });
        if(!resp.ok) return null;
        const data=await resp.json();
        return data.reply||null;
      }catch(e){console.warn("AI Summary unavailable");return null;}
    }

    async function getAIChatResponse(question,context){
      try{
        const resp=await fetch(AI_ENDPOINT,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({mode:"chat",question,context})
        });
        if(!resp.ok) return null;
        const data=await resp.json();
        return data.reply||null;
      }catch(e){console.warn("AI Chat unavailable");return null;}
    }

    // ═══════════════════════════════════
    // RENDER ANALYSIS
    // ═══════════════════════════════════
    function renderAnalysis(res,role){
      dom.scoreValue.textContent=String(res.score);dom.scoreBar.style.width=res.score+"%";
      dom.roleValue.textContent=role.ar;dom.roleNote.textContent=role.descAr;
      dom.confidenceValue.textContent=String(res.confidence?.score||50);
      dom.confidenceBar.style.width=(res.confidence?.score||50)+"%";
      dom.confidenceNote.textContent=res.confidence?.note||"";

      // Breakdown
      const bb=$("breakdownBox");
      if(res.breakdown){
        bb.style.display="block";
        bb.innerHTML=`<div class="breakdown-chips">`+
          `<span class="breakdown-chip" style="background:var(--primaryDim);color:var(--primary)">المهارات: ${res.breakdown.base}</span>`+
          (res.breakdown.experience>0?`<span class="breakdown-chip" style="background:rgba(16,185,129,0.1);color:#10B981">الخبرة: +${res.breakdown.experience}</span>`:"")+
          (res.breakdown.certs>0?`<span class="breakdown-chip" style="background:rgba(245,158,11,0.1);color:#F59E0B">الشهادات: +${res.breakdown.certs}</span>`:"")+
          (res.breakdown.tools>0?`<span class="breakdown-chip" style="background:var(--purpleDim);color:var(--purple)">الأدوات: +${res.breakdown.tools}</span>`:"")+
          (res.breakdown.sectorBoost>0?`<span class="breakdown-chip" style="background:rgba(16,185,129,0.1);color:#10B981">Saudi Lens: +${res.breakdown.sectorBoost}</span>`:"")+
          `</div>`;
      }

      // Saudi Lens Impact — مقارنة القطاعات الثلاثة
      const mkt=MARKET_DATA[role.id]||{};

      if(res.estWeeks>0){dom.estimateBadge.style.display="inline-flex";dom.estimateText.textContent=`~${res.estWeeks} أسبوع للوصول للجاهزية`;}
      else{dom.estimateBadge.style.display="none";}

      const sectorComp = analyzeAllSectors(state.profile, role);
      const currentSector = state.profile.sector || "quasi";
      const lens = SAUDI_LENS[currentSector];
      const sectorSalary = SECTOR_SALARY[role.id] || {};
      const lensBox = $("marketDataBox");
      lensBox.innerHTML =
        `<div style="margin-bottom:10px">`+
          `<div style="font-weight:900;font-size:12px;color:var(--primary);margin-bottom:8px">SAUDI LENS — ${escHtml(lens.label)}</div>`+
          `<div style="font-weight:800;font-size:15px;color:var(--success);margin-bottom:4px">${escHtml(sectorSalary[currentSector]||mkt.salaryRange)} ر.س/شهر</div>`+
          (mkt.avgSalary?`<div style="font-size:11px;color:var(--text2);margin-bottom:4px">المتوسط: ${escHtml(mkt.avgSalary)} ر.س · النمو: ${escHtml(mkt.growth||"")}</div>`:"")+
          `<div style="font-size:11px;color:var(--text2);margin-bottom:4px">${escHtml(mkt.demand)} · ${escHtml(lens.demandNote)} · الوظائف: ${escHtml(mkt.openings||"—")} وظيفة/سنة</div>`+
          (mkt.source?`<div style="font-size:10px;color:var(--muted);margin-bottom:8px">المصدر: ${escHtml(mkt.source)}</div>`:"")+
        `</div>`+
        `<div style="border-top:1px solid var(--line);padding-top:8px;margin-top:8px">`+
          `<div style="font-weight:800;font-size:11px;color:var(--muted);margin-bottom:6px">جاهزيتك حسب كل قطاع:</div>`+
          Object.entries(sectorComp).map(([sec,data])=>{
            const isActive = sec===currentSector;
            const barColor = isActive?"var(--primary)":"var(--line2)";
            const labelColor = isActive?"var(--text)":"var(--muted)";
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">`+
              `<span style="width:70px;font-size:11px;font-weight:${isActive?'800':'600'};color:${labelColor}">${escHtml(data.label)} ${isActive?'◄':''}</span>`+
              `<div style="flex:1;height:8px;background:var(--line);border-radius:99px;overflow:hidden">`+
                `<div style="height:100%;width:${data.score}%;background:${barColor};border-radius:99px;transition:width .4s"></div>`+
              `</div>`+
              `<span style="font-size:12px;font-weight:800;color:${labelColor};min-width:35px">${data.score}%</span>`+
            `</div>`;
          }).join("")+
        `</div>`+
        `<div style="margin-top:8px;padding:6px;background:rgba(59,130,246,0.05);border-radius:8px;font-size:11px;color:var(--text2);line-height:1.6">${escHtml(lens.tip)}</div>`;

      // Vision 2030
      $("visionBadgeBox").innerHTML=mkt.vision?
        `<div class="vision-badge"><span>متوافق مع: ${escHtml(mkt.vision)}</span></div>`:"";

      // Missing skills
      dom.missingList.innerHTML="";
      if(!res.missing.length){
        const li=document.createElement("li");li.innerHTML=`<span class="warn">جاهز جدًا — ركّز على مشاريع قوية!</span>`;dom.missingList.appendChild(li);
      }else{
        for(const m of res.missing.slice(0,12)){
          const ev=state.profile.evidence?.[m.skill];
          const li=document.createElement("li");li.style.marginBottom="8px";
          const row=document.createElement("div");row.className="miss-row";
          const text=document.createElement("div");text.className="miss-text";
          const b=document.createElement("b");b.textContent=m.label;
          text.appendChild(b);
          text.appendChild(document.createTextNode(` — مطلوب ${m.reqLevel}/5, مستواك ${m.userLevel}/5`));
          const evDiv=document.createElement("div");evDiv.className="miss-ev";
          if(ev?.url){const a=document.createElement("a");a.className="evlink";a.target="_blank";a.textContent="رابط الإثبات";if(ev.url.startsWith("http"))a.href=ev.url;evDiv.appendChild(a);}
          else{evDiv.innerHTML=`<span style="opacity:.7">بدون إثبات</span>`;}
          text.appendChild(evDiv);
          const resList=RESOURCES[m.skill]||RESOURCES.default;
          if(resList[0]){const rd=document.createElement("div");rd.style.cssText="margin-top:4px;font-size:11px";const rl=document.createElement("a");rl.className="evlink";rl.href=resList[0].url;rl.target="_blank";rl.textContent="📚 "+resList[0].name;rd.appendChild(rl);text.appendChild(rd);}
          const actions=document.createElement("div");actions.className="miss-actions";
          const btn=document.createElement("button");btn.className="btn btn-ghost btn-xs";btn.textContent=ev?"تعديل إثبات":"أضف إثبات";
          btn.addEventListener("click",()=>openEvidenceModal(m.skill));actions.appendChild(btn);
          row.append(text,actions);li.appendChild(row);dom.missingList.appendChild(li);
        }
      }

      // Roadmap
      dom.roadmap.innerHTML=res.roadmap.map(w=>`<div class="week"><div class="week-head"><div class="w">الأسبوع ${w.week} <span class="phase-tag">${escHtml(w.phase)}</span></div><div class="focus">${w.focus.map(f=>escHtml(f)).join(" + ")}</div></div><ul>${w.tasks.map(t=>`<li>${escHtml(t.title)} <span style="color:var(--muted)">— ${escHtml(t.resource)}</span></li>`).join("")}</ul></div>`).join("");

      // Projects
      dom.projects.innerHTML=res.projects.map(p=>`<div class="project"><h5>${escHtml(p.title)}</h5><div class="small" style="margin-top:6px">${escHtml(p.objective)}</div>${(p.deliverables||[]).length?`<div class="proj-meta">${p.deliverables.map(d=>`<span class="proj-tag">${escHtml(d)}</span>`).join("")}</div>`:""}</div>`).join("");

      try{drawBarChart(dom.barChart,res.charts);drawRadarChart(dom.radarChart,res.charts);}catch(e){console.error(e);}
      state.completedSteps.add("analysis");

      // AI Summary (async)
      const aiBox=$("aiSummaryBox");
      aiBox.style.display="block";
      aiBox.innerHTML=`<h4>ملخص سِراج الذكي</h4><p style="color:var(--muted)">جاري التحليل بالذكاء الاصطناعي...</p>`;
      getAISummary(state.profile,role,res).then(summary=>{
        if(summary){
          aiBox.innerHTML=`<h4>ملخص سِراج الذكي (AI)</h4><p>${escHtml(summary)}</p>`;
        }else{
          // Fallback summary
          const lvl=res.score>=75?"ممتاز":res.score>=50?"جيد":res.score>=30?"متوسط":"مبتدئ";
          const tip=res.missing.length>0?`ركّز على ${res.missing[0].label} كأولوية أولى.`:"ملفك قوي، ركّز على البورتفوليو.";
          aiBox.innerHTML=`<h4>ملخص سِراج الذكي</h4><p>مستوى جاهزيتك لوظيفة ${escHtml(role.ar)} هو <b>${lvl}</b> بنسبة ${res.score}%. ${tip} ${res.estWeeks>0?`تحتاج تقريباً ${res.estWeeks} أسبوع للوصول لجاهزية مناسبة.`:""} القطاع ${state.profile.sector==="gov"?"الحكومي":state.profile.sector==="private"?"الخاص":"الشبه حكومي"} يركز أكثر على ${state.profile.sector==="gov"?"المهارات الإدارية والتواصل":"المهارات التقنية التخصصية"}.</p>`;
        }
      });
    }

    // ═══════════════════════════════════
    // CHARTS
    // ═══════════════════════════════════
    function setupCanvas(canvas){const rect=canvas.parentElement.getBoundingClientRect();const dpr=window.devicePixelRatio||1;const w=Math.max(280,rect.width-24);const h=280;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+"px";canvas.style.height=h+"px";const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);return{ctx,W:w,H:h};}
    function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

    function drawBarChart(canvas,data){
      if(!data||!data.length)return;const{ctx,W,H}=setupCanvas(canvas);ctx.clearRect(0,0,W,H);
      const pad={t:50,b:60,l:50,r:20};const cW=W-pad.l-pad.r;const cH=H-pad.t-pad.b;const n=data.length;const gW=cW/n;const bW=gW*0.28;
      ctx.strokeStyle="#2a3530";ctx.lineWidth=1;
      for(let i=1;i<=5;i++){const y=pad.t+cH-cH*(i/5);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();ctx.fillStyle="#6b7c73";ctx.font="11px system-ui";ctx.fillText(String(i),pad.l-20,y+4);}
      ctx.fillStyle="#e8ede9";ctx.font="bold 14px system-ui";ctx.fillText("مطابقة المهارات",pad.l,30);
      for(let i=0;i<n;i++){const d=data[i];const x0=pad.l+i*gW+gW/2;const uH=cH*(d.user/5);const rH=cH*(d.req/5);
        ctx.fillStyle="rgba(59,130,246,0.12)";ctx.beginPath();roundRect(ctx,x0-bW-4,pad.t+cH-rH,bW,rH,4);ctx.fill();
        const grad=ctx.createLinearGradient(0,pad.t+cH-uH,0,pad.t+cH);grad.addColorStop(0,"#3B82F6");grad.addColorStop(1,"#1D4ED8");ctx.fillStyle=grad;ctx.beginPath();roundRect(ctx,x0+4,pad.t+cH-uH,bW,uH,4);ctx.fill();
        ctx.fillStyle="#a3b0a8";ctx.font="11px system-ui";const lbl=d.label.length>10?d.label.slice(0,10)+"…":d.label;ctx.save();ctx.translate(x0,H-pad.b+16);ctx.rotate(-0.4);ctx.fillText(lbl,-20,0);ctx.restore();}
      ctx.fillStyle="#3B82F6";roundRect(ctx,W-160,14,12,12,3);ctx.fill();ctx.fillStyle="#a3b0a8";ctx.font="11px system-ui";ctx.fillText("مستواك",W-142,24);
      ctx.fillStyle="rgba(59,130,246,0.15)";roundRect(ctx,W-90,14,12,12,3);ctx.fill();ctx.fillStyle="#a3b0a8";ctx.fillText("المطلوب",W-72,24);
    }

    function drawRadarChart(canvas,data){
      if(!data||!data.length)return;const{ctx,W,H}=setupCanvas(canvas);ctx.clearRect(0,0,W,H);
      const cx=W/2;const cy=H/2+16;const R=Math.min(W,H)*0.32;const n=data.length;
      for(let r=1;r<=5;r++){const rr=(R*r)/5;ctx.strokeStyle="#2a3530";ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<n;i++){const a=(Math.PI*2*i)/n-Math.PI/2;const x=cx+Math.cos(a)*rr;const y=cy+Math.sin(a)*rr;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();}
      for(let i=0;i<n;i++){const a=(Math.PI*2*i)/n-Math.PI/2;ctx.strokeStyle="#2a3530";ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);ctx.stroke();const lx=cx+Math.cos(a)*(R+16);const ly=cy+Math.sin(a)*(R+16);ctx.fillStyle="#a3b0a8";ctx.font="10px system-ui";const lbl=data[i].label.length>10?data[i].label.slice(0,10)+"…":data[i].label;ctx.fillText(lbl,lx-20,ly+4);}
      function poly(vals,fill,stroke){ctx.beginPath();for(let i=0;i<n;i++){const a=(Math.PI*2*i)/n-Math.PI/2;const rr=R*(vals[i]/5);const x=cx+Math.cos(a)*rr;const y=cy+Math.sin(a)*rr;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.closePath();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.fill();ctx.stroke();}
      poly(data.map(d=>d.req),"rgba(59,130,246,0.06)","#344038");
      poly(data.map(d=>d.user),"rgba(59,130,246,0.18)","#3B82F6");
    }

    // ═══════════════════════════════════
    // EVIDENCE MODAL
    // ═══════════════════════════════════
    function openEvidenceModal(skillKey){
      state.currentEvidenceSkill=skillKey;
      const current=state.profile.evidence?.[skillKey]||{};
      $("evidenceModalTitle").textContent=`إثبات: ${skillLabel(skillKey)}`;
      $("evidenceUrl").value=current.url||"";$("evidenceType").value=current.type||"github";$("evidenceNote").value=current.note||"";
      $("evidenceModal").classList.add("open");
    }
    function closeEvidenceModal(){$("evidenceModal").classList.remove("open");state.currentEvidenceSkill=null;}
    function saveEvidence(){
      const sk=state.currentEvidenceSkill;if(!sk) return;
      if(!state.profile.evidence) state.profile.evidence={};
      state.profile.evidence[sk]={url:$("evidenceUrl").value.trim(),type:$("evidenceType").value,note:$("evidenceNote").value.trim(),updatedAt:nowISO()};
      store.set(STORAGE_KEY_PROFILE,state.profile);toast("تم حفظ الإثبات");
      if(state.analysis) renderAnalysis(state.analysis.res,state.analysis.role);
      closeEvidenceModal();
    }

    // ═══════════════════════════════════
    // CHAT (AI + Local Fallback)
    // ═══════════════════════════════════
    function saySiraj(sender,text){
      const w=document.createElement("div");w.className="msg "+(sender==="siraj"?"msg-siraj":"msg-user");
      const b=document.createElement("div");b.className="bubble";w.appendChild(b);
      dom.dialog.appendChild(w);dom.dialog.scrollTop=dom.dialog.scrollHeight;
      if(sender==="user"){b.textContent=text;return;}
      let i=0;b.textContent="";
      function type(){if(i<text.length){b.textContent+=text.charAt(i);i++;dom.dialog.scrollTop=dom.dialog.scrollHeight;setTimeout(type,15);}}
      type();
    }

    function showTyping(){
      const w=document.createElement("div");w.className="msg msg-siraj";w.id="typingMsg";
      w.innerHTML=`<div class="bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
      dom.dialog.appendChild(w);dom.dialog.scrollTop=dom.dialog.scrollHeight;
    }
    function removeTyping(){const t=$("typingMsg");if(t) t.remove();}

    async function handleChat(text){
      const raw=(text||"").trim();if(!raw) return;
      saySiraj("user",raw);
      const t=raw.toLowerCase();

      // Build context
      const context={
        major:state.profile.major,
        skills:state.profile.skills.map(s=>({name:skillLabel(s.key),level:s.level})),
        experience:state.profile.experienceYears,
        sector:state.profile.sector,
        certs:state.profile.certs,
        selectedRole:state.selectedRoleId?ROLES.find(r=>r.id===state.selectedRoleId)?.ar:null,
        score:state.analysis?.res?.score||null,
        topGaps:state.analysis?.res?.missing?.slice(0,3).map(m=>m.label)||[]
      };

      // Interview mode
      if(t.includes("مقابلة")||t.includes("سؤال مقابلة")){
        const roleId=state.selectedRoleId||"default";
        const questions=INTERVIEW_DB[roleId]||INTERVIEW_DB.default;
        const q=questions[state.interviewIdx%questions.length];
        state.interviewIdx++;
        saySiraj("siraj",`سؤال مقابلة: ${q}\n\nفكّر وجاوب، وإذا تبي سؤال ثاني اضغط "مقابلة تجريبية" مرة ثانية.`);
        return;
      }

      // Try AI first
      showTyping();
      const aiReply=await getAIChatResponse(raw,context);
      removeTyping();
      if(aiReply){saySiraj("siraj",aiReply);return;}

      // Local fallback
      if(t.includes("ناقصني")||t.includes("وش ناقصني")){
        if(!state.analysis){saySiraj("siraj","حلّل جاهزيتك أولاً من تبويب التحليل، بعدها أقدر أخبرك وش ناقصك بالضبط.");return;}
        const gaps=state.analysis.res.missing.slice(0,3).map(m=>`${m.label} (مطلوب ${m.reqLevel}, مستواك ${m.userLevel})`).join("\n• ");
        saySiraj("siraj",`أهم الفجوات عندك:\n• ${gaps}\n\nركّز على هالمهارات أولاً وأضف إثباتات.`);return;
      }
      if(t.includes("أفضل وظيفة")||t.includes("وظيفة لي")){autoPickBestRole();setTab("roles");saySiraj("siraj","اخترت لك أنسب وظيفة بناءً على مهاراتك. شوف تبويب الوظائف!");return;}
      if(t.includes("أسبوع")||t.includes("كم وقت")){
        if(!state.analysis){saySiraj("siraj","حلّل جاهزيتك أولاً عشان أقدر أعطيك تقدير.");return;}
        saySiraj("siraj",`بناءً على تحليلك، تحتاج تقريباً ${state.analysis.res.estWeeks} أسبوع. الخطة موجودة في تبويب التحليل.`);return;
      }
      if(t.includes("نصيحة")||t.includes("تحسين")){
        const tips=[];
        if((state.profile.skills||[]).length<5) tips.push("أضف مزيد من المهارات لرفع دقة التحليل.");
        if(!state.profile.experienceYears) tips.push("لو عندك أي خبرة (حتى تدريب) سجّلها — ترفع نسبتك.");
        if(!state.profile.certs.length) tips.push("الشهادات ترفع نسبتك — جرب Google Certificates المجانية.");
        if(!(state.profile.tools||[]).length) tips.push("أضف الأدوات اللي تعرفها حتى لو بسيطة.");
        if(!tips.length) tips.push("ملفك ممتاز! ركّز على بناء مشاريع بورتفوليو قوية.");
        saySiraj("siraj",tips.join("\n• "));return;
      }
      if(t.includes("مرحبا")||t.includes("هلا")||t.includes("السلام")){saySiraj("siraj","أهلاً وسهلاً! أنا سِراج، مستشارك المهني الذكي. كيف أقدر أساعدك اليوم؟");return;}
      if(t.includes("شكرا")||t.includes("شكراً")){saySiraj("siraj","العفو! أنا هنا لمساعدتك. إذا عندك أي سؤال ثاني لا تتردد.");return;}
      if(t.includes("سراج")||t.includes("ما هو")){saySiraj("siraj","أنا سِراج — مستشار مهني سعودي ذكي. أحلل فجوة مهاراتك مقارنة بسوق العمل السعودي، وأبني لك خارطة طريق مخصصة مع مشاريع بورتفوليو.");return;}
      saySiraj("siraj","أقدر أساعدك في:\n• اختيار الوظيفة الأنسب\n• تحليل الفجوات\n• نصائح تحسين الملف\n• تقدير الوقت المطلوب\n• مقابلة تجريبية\n\nجرب الأزرار السريعة أو اكتب سؤالك.");
    }

    // ═══════════════════════════════════
    // COMPARE ROLES
    // ═══════════════════════════════════
    function runComparison(){
      if(!validateProfile()){toast("أكمل الملف أولاً");return;}
      const r1=ROLES.find(r=>r.id===dom.compare1.value);const r2=ROLES.find(r=>r.id===dom.compare2.value);if(!r1||!r2) return;
      const a1=analyzeFallback(state.profile,r1);const a2=analyzeFallback(state.profile,r2);
      const sec=state.profile.sector||"quasi";
      const s1=SECTOR_SALARY[r1.id]||{};const s2=SECTOR_SALARY[r2.id]||{};
      const m1=MARKET_DATA[r1.id]||{};const m2=MARKET_DATA[r2.id]||{};
      dom.compareResult.innerHTML=
        `<div class="compare-col"><h5>${escHtml(r1.ar)}</h5>`+
        `<div class="compare-row"><span>الجاهزية</span><b style="color:var(--primary)">${a1.score}%</b></div>`+
        `<div class="compare-row"><span>الفجوات</span><span>${a1.missing.length}</span></div>`+
        `<div class="compare-row"><span>الأسابيع</span><span>${a1.estWeeks}</span></div>`+
        `<div class="compare-row"><span>الراتب (${escHtml(SAUDI_LENS[sec].label)})</span><span>${escHtml(s1[sec]||m1.salaryRange||"—")}</span></div>`+
        `<div class="compare-row"><span>الطلب</span><span>${escHtml(m1.demand||"—")}</span></div></div>`+
        `<div class="compare-col"><h5>${escHtml(r2.ar)}</h5>`+
        `<div class="compare-row"><span>الجاهزية</span><b style="color:var(--primary)">${a2.score}%</b></div>`+
        `<div class="compare-row"><span>الفجوات</span><span>${a2.missing.length}</span></div>`+
        `<div class="compare-row"><span>الأسابيع</span><span>${a2.estWeeks}</span></div>`+
        `<div class="compare-row"><span>الراتب (${escHtml(SAUDI_LENS[sec].label)})</span><span>${escHtml(s2[sec]||m2.salaryRange||"—")}</span></div>`+
        `<div class="compare-row"><span>الطلب</span><span>${escHtml(m2.demand||"—")}</span></div></div>`;
    }

    // ═══════════════════════════════════
    // REPORT + PDF
    // ═══════════════════════════════════
    function buildReport(){
      if(!state.analysis) return null;
      return{id:state.reportId||uid(),createdAt:nowISO(),profile:state.profile,role:{id:state.analysis.role.id,name:state.analysis.role.ar},result:state.analysis.res};
    }

    function renderReport(rep){
      dom.reportSummary.innerHTML=
        `<div class="report-stat"><div class="val">${rep.result.score}%</div><div class="lbl">الجاهزية</div></div>`+
        `<div class="report-stat"><div class="val">${rep.result.missing.length}</div><div class="lbl">فجوات</div></div>`+
        `<div class="report-stat"><div class="val">${rep.result.estWeeks}</div><div class="lbl">أسابيع</div></div>`+
        `<div class="report-stat"><div class="val">${rep.result.confidence?.score||0}%</div><div class="lbl">ثقة التحليل</div></div>`;
      dom.reportJson.textContent=JSON.stringify(rep,null,2);
    }

    async function downloadPDF(rep){
      toast("جاري تجهيز التقرير...");
      const mkt=MARKET_DATA[rep.role.id]||{};
      const bd=rep.result.breakdown||{};
      const missing=(rep.result.missing||[]).slice(0,10);
      const roadmap=(rep.result.roadmap||[]).slice(0,8);
      const sectorName=rep.profile.sector==="gov"?"حكومي":rep.profile.sector==="private"?"خاص":"شبه حكومي";
      const prefsName={fast:"مكثف",balanced:"متوازن",parttime:"جزئي"}[rep.profile.prefs]||"متوازن";

      const W=595*2, H=842*2, mg=70;
      const rE=W-mg, cW=W-mg*2;
      const pages=[]; let cv,c,Y;

      // ─── HELPERS ───
      function newPage(){
        cv=document.createElement("canvas");cv.width=W;cv.height=H;
        c=cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,W,H);
        pages.push(cv);Y=60;
      }
      function need(h){if(Y+h>H-80) newPage();}
      function txt(t,x,y,s,co,w){c.fillStyle=co||"#222";c.font=(w||"700")+" "+s+"px Tahoma,'Noto Kufi Arabic',sans-serif";c.textAlign="right";c.textBaseline="top";c.fillText(String(t),x,y);}
      function txtL(t,x,y,s,co,w){c.fillStyle=co||"#222";c.font=(w||"400")+" "+s+"px Tahoma,'Noto Kufi Arabic',sans-serif";c.textAlign="left";c.textBaseline="top";c.fillText(String(t),x,y);}
      function txtC(t,x,y,s,co,w){c.fillStyle=co||"#222";c.font=(w||"700")+" "+s+"px Tahoma,'Noto Kufi Arabic',sans-serif";c.textAlign="center";c.textBaseline="top";c.fillText(String(t),x,y);}
      function bx(x,y,w,h,f,r){c.fillStyle=f;c.beginPath();if(r){c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);}else{c.rect(x,y,w,h);}c.closePath();c.fill();}
      function ln(x1,y1,x2,y2,co,lw){c.strokeStyle=co||"#E5E7EB";c.lineWidth=lw||1.5;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
      function circle(x,y,r,fill){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();}
      function sectionTitle(title){need(60);bx(mg,Y,4,28,"#1E3A8A",0);txt(title,rE,Y+2,20,"#1E3A8A","900");ln(mg,Y+34,rE,Y+34,"#CBD5E1",1.5);Y+=48;}

      // ═══════════════════════════════
      // PAGE 1
      // ═══════════════════════════════
      newPage(); Y=0;

      // ─── HEADER (Dark Navy) ───
      bx(0,0,W,160,"#0F172A",0);
      bx(0,155,W,5,"#3B82F6",0);
      txt("سِراج  SIRAJ",rE-30,35,48,"#fff","900");
      txt("التقرير الاستشاري للجاهزية المهنية",rE-30,95,22,"#F59E0B","700");
      txtL("REF: "+rep.id.slice(0,20).toUpperCase()+"  |  "+new Date().toLocaleDateString("ar-SA"),mg+20,125,13,"#64748B","400");
      Y=185;

      // ─── بيانات الطالب ───
      sectionTitle("بيانات الطالب");
      bx(mg,Y,cW,90,"#F8FAFC",12);
      c.strokeStyle="#E2E8F0";c.lineWidth=1;c.beginPath();c.moveTo(mg+12,Y);c.lineTo(mg+cW-12,Y);c.lineTo(mg+cW,Y+12);c.lineTo(mg+cW,Y+78);c.lineTo(mg+cW-12,Y+90);c.lineTo(mg+12,Y+90);c.lineTo(mg,Y+78);c.lineTo(mg,Y+12);c.closePath();c.stroke();
      txt("التخصص: "+(rep.profile.major||"—"),rE-20,Y+12,15,"#1E293B","700");
      txt("الخبرة: "+(rep.profile.experienceYears||0)+" سنة  |  المستوى: "+(rep.profile.eduLevel==="GRAD"?"خريج":rep.profile.eduLevel==="PRO"?"محترف":"جامعة"),rE-20,Y+36,14,"#475569","400");
      txt("الشهادات: "+((rep.profile.certs||[]).slice(0,3).join("، ")||"—"),rE-20,Y+60,14,"#475569","400");
      txtL("الأدوات: "+((rep.profile.tools||[]).slice(0,5).join("، ")||"—"),mg+20,Y+60,14,"#475569","400");
      Y+=110;

      // ─── الملخص التنفيذي ───
      sectionTitle("الملخص التنفيذي");
      bx(mg,Y,cW,160,"#F0F7FF",14);
      c.strokeStyle="#BFDBFE";c.lineWidth=1.5;c.stroke();

      // Score circle
      const scoreCol=rep.result.score>=70?"#10B981":rep.result.score>=40?"#F59E0B":"#EF4444";
      const cx0=mg+100, cy0=Y+80, cr0=55;
      // Background ring
      c.beginPath();c.arc(cx0,cy0,cr0,0,Math.PI*2);c.strokeStyle="#E2E8F0";c.lineWidth=10;c.stroke();
      // Score arc
      const scoreAngle=(rep.result.score/100)*Math.PI*2;
      c.beginPath();c.arc(cx0,cy0,cr0,-Math.PI/2,-Math.PI/2+scoreAngle);c.strokeStyle=scoreCol;c.lineWidth=10;c.lineCap="round";c.stroke();c.lineCap="butt";
      // Score text
      c.fillStyle=scoreCol;c.font="900 40px Tahoma";c.textAlign="center";c.fillText(rep.result.score+"%",cx0,cy0-16);
      c.fillStyle="#64748B";c.font="700 12px Tahoma";c.fillText("الجاهزية",cx0,cy0+22);

      // Info right side
      const infoX=rE-20;
      txt("الوظيفة: "+rep.role.name,infoX,Y+16,18,"#1E293B","900");
      txt("القطاع: "+sectorName+"  |  الأسابيع: "+rep.result.estWeeks+"  |  الثقة: "+(rep.result.confidence?.score||0)+"%",infoX,Y+44,14,"#475569","400");
      txt("عدد الفجوات: "+missing.length+"  |  عدد المهارات: "+(rep.profile.skills||[]).length,infoX,Y+68,14,"#475569","400");

      // Breakdown chips
      const chips=[{l:"المهارات "+bd.base,bg:"#DBEAFE",cl:"#1D4ED8"}];
      if(bd.experience>0) chips.push({l:"الخبرة +"+bd.experience,bg:"#D1FAE5",cl:"#059669"});
      if(bd.certs>0) chips.push({l:"الشهادات +"+bd.certs,bg:"#FEF3C7",cl:"#D97706"});
      if(bd.tools>0) chips.push({l:"الأدوات +"+bd.tools,bg:"#EDE9FE",cl:"#7C3AED"});
      if(bd.sectorBoost>0) chips.push({l:"Saudi Lens +"+bd.sectorBoost,bg:"#D1FAE5",cl:"#059669"});
      let chipX=infoX;
      for(const ch of chips){
        c.font="700 13px Tahoma";const tw=c.measureText(ch.l).width;
        bx(chipX-tw-16,Y+96,tw+24,26,ch.bg,8);
        txt(ch.l,chipX-4,Y+100,13,ch.cl,"700");
        chipX-=tw+32;
      }
      Y+=180;

      // ─── Saudi Market Bar ───
      if(mkt.salaryRange){
        need(45);
        bx(mg,Y,cW,36,"#ECFDF5",8);
        const secSalary=SECTOR_SALARY[rep.role.id]||{};
        const salary=secSalary[rep.profile.sector]||mkt.salaryRange;
        txt("رؤية 2030: "+(mkt.vision||""),rE-16,Y+8,13,"#065F46","700");
        txtL("سوق العمل السعودي — الراتب: "+salary+" ر.س  |  الطلب: "+(mkt.demand||""),mg+16,Y+8,13,"#065F46","700");
        Y+=50;
      }

      // ─── تحليل المهارات (Charts) ───
      sectionTitle("تحليل المهارات");
      try{
        const bI=dom.barChart.toDataURL("image/png");
        const rI=dom.radarChart.toDataURL("image/png");
        const chW=(cW-20)/2, chH=260;
        const imgB=await loadImg(bI);
        const imgR=await loadImg(rI);
        // Bar chart left, Radar right
        bx(mg,Y,chW,chH,"#F8FAFC",10);
        c.drawImage(imgB,mg+4,Y+4,chW-8,chH-8);
        bx(mg+chW+20,Y,chW,chH,"#F8FAFC",10);
        c.drawImage(imgR,mg+chW+24,Y+4,chW-8,chH-8);
        Y+=chH+16;
      }catch(e){Y+=10;}

      // ─── فجوة المهارات (Table) ───
      if(missing.length){
        sectionTitle("فجوة المهارات");
        // Table header
        const cols=[{l:"المهارة",w:200},{l:"المطلوب",w:100},{l:"مستواك",w:100},{l:"الفجوة",w:100},{l:"المورد التعليمي",w:cW-500}];
        let colX=rE;
        bx(mg,Y,cW,32,"#1E3A8A",0);
        for(const col of cols){
          txt(col.l,colX-8,Y+6,13,"#fff","800");
          colX-=col.w;
        }
        Y+=32;
        // Table rows
        for(let i=0;i<missing.length;i++){
          need(32);
          const m=missing[i];
          const bg=i%2===0?"#F8FAFC":"#fff";
          bx(mg,Y,cW,30,bg,0);
          ln(mg,Y+30,rE,Y+30,"#E2E8F0",1);
          colX=rE;
          const gap=Math.max(0,m.reqLevel-m.userLevel);
          const rs=RESOURCES[m.skill]||RESOURCES.default;
          const vals=[m.label, m.reqLevel+"/5", m.userLevel+"/5", String(gap), rs[0]?.name||"منصة سطر"];
          const colors=["#1E293B","#475569","#475569",gap>0?"#DC2626":"#059669","#3B82F6"];
          const weights=["700","400","400","800","400"];
          for(let j=0;j<cols.length;j++){
            txt(vals[j],colX-8,Y+6,13,colors[j],weights[j]);
            colX-=cols[j].w;
          }
          Y+=30;
        }
        Y+=16;
      }

      // ─── خارطة الطريق (Table) ───
      if(roadmap.length){
        sectionTitle("خارطة الطريق المخصصة ("+prefsName+")");
        // Table header
        const rcols=[{l:"",w:110},{l:"المرحلة",w:120},{l:"التركيز",w:250},{l:"المورد",w:cW-480}];
        bx(mg,Y,cW,32,"#1E3A8A",0);
        let rx=rE;
        // Column headers right to left
        txt("الأسبوع",rE-8,Y+6,13,"#fff","800");
        txt("المرحلة",rE-118,Y+6,13,"#fff","800");
        txt("التركيز",rE-238,Y+6,13,"#fff","800");
        txtL("المورد",mg+16,Y+6,13,"#fff","800");
        Y+=32;
        for(let i=0;i<roadmap.length;i++){
          need(32);
          const w=roadmap[i];
          const bg=i%2===0?"#F8FAFC":"#fff";
          bx(mg,Y,cW,30,bg,0);
          ln(mg,Y+30,rE,Y+30,"#E2E8F0",1);
          txt("الأسبوع "+w.week,rE-8,Y+6,13,"#1E293B","700");
          txt(w.phase,rE-118,Y+6,13,"#3B82F6","700");
          txt(w.focus.join(" + "),rE-238,Y+6,13,"#475569","400");
          const sk=missing.find(m2=>m2.label===w.focus[0]);
          const rs=sk?RESOURCES[sk.skill]||RESOURCES.default:RESOURCES.default;
          txtL(rs[0]?.name||"منصة سطر",mg+16,Y+6,13,"#64748B","400");
          Y+=30;
        }
        Y+=16;
      }

      // ─── مشاريع البورتفوليو ───
      const projects=(rep.result.projects||[]).slice(0,3);
      if(projects.length&&projects[0].title!=="مشروع تطبيقي عام"){
        sectionTitle("مشاريع بورتفوليو مقترحة");
        for(const p of projects){
          need(70);
          bx(mg,Y,cW,58,"#F8FAFC",10);
          bx(rE-4,Y+4,4,50,"#F59E0B",2);
          txt(p.title||"مشروع تطبيقي",rE-16,Y+10,15,"#1E293B","800");
          txt(p.objective||"",rE-16,Y+32,13,"#475569","400");
          Y+=68;
        }
        Y+=8;
      }

      // ─── Closing Message ───
      need(120);Y+=10;
      bx(mg,Y,cW,90,"#0F172A",14);
      txtC("سِراج — رسالة تحفيزية",W/2,Y+14,18,"#F59E0B","900");
      const msg=rep.result.score>=70?"أنت في وضع ممتاز! ركّز على البورتفوليو وابدأ التقديم بثقة.":rep.result.score>=40?"عندك أساس جيد! اتبع خارطة الطريق وركّز على أعلى الفجوات أثراً.":"كل خبير بدأ من الصفر. ابدأ بالمهارة الأولى واستمر — الرحلة تستاهل.";
      txtC(msg,W/2,Y+42,14,"#CBD5E1","400");
      txtC("المملكة تحتاج كفاءات مثلك لتحقيق رؤية 2030",W/2,Y+66,13,"#64748B","400");
      Y+=110;

      // Footer
      need(30);
      ln(mg,H-50,rE,H-50,"#CBD5E1",1);
      txtC("تم التوليد آلياً عبر محرك سِراج — مصادر البيانات: Glassdoor, ERI SalaryExpert, PayScale, GulfTalent 2025-2026",W/2,H-38,11,"#94A3B8","400");

      // ═══ EXPORT ═══
      try{
        const{jsPDF}=window.jspdf;
        const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
        for(let i=0;i<pages.length;i++){
          if(i>0) pdf.addPage();
          pdf.addImage(pages[i].toDataURL("image/jpeg",0.95),"JPEG",0,0,210,297);
        }
        pdf.save("Siraj_Report_"+rep.id+".pdf");
        toast("تم تصدير التقرير ("+pages.length+" صفحات)");
      }catch(err){
        console.error("jsPDF error:",err);
        const a=document.createElement("a");a.download="Siraj_Report.png";a.href=pages[0].toDataURL("image/png");a.click();
        toast("تم تصدير كصورة PNG");
      }
    }

    function loadImg(src){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=src;});}

    // ═══════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════
    function bindEvents(){
      dom.tabs.forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
      dom.steps.forEach(s=>s.addEventListener("click",()=>setTab(s.dataset.step)));

      $("startAppBtn").addEventListener("click",()=>{
        const landing=$("landingPage");const app=$("appContent");
        landing.classList.add("fade-out-landing");
        setTimeout(()=>{landing.style.display="none";app.style.display="block";app.classList.add("fade-in-app");
          saySiraj("siraj","مرحباً بك! أنا سِراج، مستشارك المهني الذكي.\n\nلنبدأ بتسجيل تخصصك ومهاراتك عشان نبني خطتك المهنية.");},500);
      });

      $("addSkillBtn").addEventListener("click",()=>{addSkill(dom.skillName.value,dom.skillLevel.value);dom.skillName.value="";dom.skillName.focus();});
      dom.skillName.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("addSkillBtn").click();}});

      $("loadSampleBtn").addEventListener("click",()=>{
        dom.major.value="نظم المعلومات";dom.experienceYears.value="1";dom.sector.value="quasi";
        dom.certs.value="Google Data Analytics";dom.tools.value="Power BI, Excel, Git";
        state.profile.major="نظم المعلومات";state.profile.eduLevel="UNI";state.profile.experienceYears=1;
        state.profile.sector="quasi";state.profile.certs=["Google Data Analytics"];state.profile.tools=["Power BI","Excel","Git"];
        state.profile.skills=[
          {raw:"SQL",key:"sql",level:3},{raw:"Power BI",key:"powerbi",level:4},{raw:"Excel",key:"excel",level:4},
          {raw:"تحليل المتطلبات",key:"requirements",level:2},{raw:"الإحصاء",key:"statistics",level:2},{raw:"التواصل",key:"communication",level:3}
        ];
        renderSkillsTable();state.selectedRoleId="data_analyst";renderRoles();
        toast("تم تحميل بيانات الديمو");
      });

      $("saveProfileBtn").addEventListener("click",saveProfile);
      $("resetProfileBtn").addEventListener("click",resetProfile);
      $("nextStepBtn").addEventListener("click",()=>{
        if(!validateProfile()){toast("أكمل التخصص والمهارات أولاً");return;}
        saveProfile();setTab("roles");window.scrollTo({top:0,behavior:"smooth"});
      });

      $("autoPickBtn").addEventListener("click",autoPickBestRole);
      $("compareBtn").addEventListener("click",()=>{dom.comparePanel.style.display=dom.comparePanel.style.display==="none"?"block":"none";});
      $("runCompareBtn").addEventListener("click",runComparison);

      $("analyzeBtn").addEventListener("click",()=>{
        if(!validateProfile()){toast("أكمل الملف أولاً");setTab("profile");return;}
        if(!state.selectedRoleId){toast("اختر الوظيفة أولاً");return;}
        const role=ROLES.find(r=>r.id===state.selectedRoleId);if(!role) return;
        const btn=$("analyzeBtn");const orig=btn.innerHTML;
        btn.innerHTML="جاري التحليل بالذكاء الاصطناعي...";btn.disabled=true;btn.classList.add("tech-bulb-loading");

        setTimeout(()=>{
          try{
            const res=analyzeFallback(state.profile,role);
            state.analysis={role,res};renderAnalysis(res,role);setTab("analysis");
            saySiraj("siraj",`اكتمل التحليل! نسبة جاهزيتك لـ "${role.ar}" هي ${res.score}/100.`);
          }catch(e){toast("خطأ بالتحليل");console.error(e);}
          finally{btn.innerHTML=orig;btn.disabled=false;btn.classList.remove("tech-bulb-loading");}
        },1500);
      });

      $("saveReportBtn").addEventListener("click",()=>{
        const rep=buildReport();if(!rep) return;
        state.reportId=rep.id;state.lastReport=rep;
        const reports=store.get(STORAGE_KEY_REPORTS,{});reports[rep.id]=rep;store.set(STORAGE_KEY_REPORTS,reports);
        renderReport(rep);setTab("report");toast("تم حفظ التقرير");
      });

      $("downloadPdfBtn").addEventListener("click",()=>{
        if(!state.analysis) return toast("حلّل الجاهزية أولاً");
        const rep=state.lastReport||buildReport();if(rep) downloadPDF(rep);
      });

      $("downloadJsonBtn").addEventListener("click",()=>{
        const rep=state.lastReport||buildReport();if(!rep) return toast("لا يوجد تقرير");
        const blob=new Blob([JSON.stringify(rep,null,2)],{type:"application/json"});
        const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Siraj_Report_${rep.id}.json`;a.click();
        toast("تم تحميل JSON");
      });

      $("shareBtn").addEventListener("click",()=>{
        const data=state.analysis?{s:state.analysis.res.score,r:state.selectedRoleId}:{};
        const url=window.location.origin+window.location.pathname+"#"+btoa(JSON.stringify(data));
        navigator.clipboard.writeText(url).then(()=>toast("تم نسخ الرابط!")).catch(()=>toast("تعذر النسخ"));
      });

      $("copyLinkBtn").addEventListener("click",()=>{
        const rep=state.lastReport;if(!rep) return toast("احفظ التقرير أولاً");
        const url=window.location.origin+window.location.pathname+"#report="+rep.id;
        navigator.clipboard.writeText(url).then(()=>toast("تم نسخ الرابط!")).catch(()=>toast("تعذر النسخ"));
      });

      $("langBtn").addEventListener("click",()=>toast("English coming soon — MVP"));

      $("evidenceSaveBtn").addEventListener("click",saveEvidence);
      $("evidenceCancelBtn").addEventListener("click",closeEvidenceModal);
      $("evidenceModal").addEventListener("click",e=>{if(e.target===$("evidenceModal")) closeEvidenceModal();});

      $("chatSendBtn").addEventListener("click",()=>{handleChat(dom.chatInput.value);dom.chatInput.value="";dom.chatInput.focus();});
      dom.chatInput.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("chatSendBtn").click();}});
      document.querySelectorAll(".quick-btn").forEach(b=>b.addEventListener("click",()=>handleChat(b.dataset.q)));
    }

    // ═══════════════════════════════════
    // INIT
    // ═══════════════════════════════════
    function init(){cacheDom();bindEvents();loadProfile();renderRoles();setTab("profile");}
    init();
  })();