
export const ITEM_PER_PAGE = 10



// Route Access Configuration
export const routeAccessMap = {
  "/": [], // Public
  "/applynow": [], 
  "/welcome": [], 
  "/aboutMuslimschool": [], 
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/settings(.*)": ["admin"],
  "/profile(.*)": ["admin"],
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin", "teacher"],
  "/list/parents": ["admin", "teacher"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "teacher"],
  "/list/exams": ["admin", "teacher", "student", "parent"],
  "/list/assignments": ["admin", "teacher", "student", "parent"],
  "/list/results": ["admin", "teacher", "student", "parent"],
};
