
//Se crea una export interface llamada LoginPayload porque se reutiliza mucho esto
export interface LoginPayload {
  email: string;
  password: string
}

//interface del losgin response
export interface LoginResponse {
  access_token: string,
  token_type: string,
  user_id: string,
  email: string,
  role: string
}

export interface ForgotPassword {
  email: string
}

export interface BlogPost {
  id: string,
  title: string,
  slug: string,
  content: string,
  excerpt?: string, //para hacerlo opcional
  featured_image: string,
  status: string,
  seo_title: string,
  seo_description: string,
  seo_keywords: string,
  published_at: string,
  created_at: string,
  updated_at: string
}

export interface Course {
  id: string,
  title: string,
  slug: string,
  description: string,
  short_description?: string,
  thumbnail: string,
  thumbnail_url: string,
  level?: string,
  access_type: string,
  price: number,
  lessons_count: number,
  enrolled_count: number,
  rating_avg: number,
  rating_count: number,
  instructor_name: string,
  teacher_name: string,
  is_enrolled: boolean,
  status: string,
  sections: []
}

export interface Environment {
    BASE_URL: string;
    TEST_USER_EMAIL: string;
    TEST_USER_PASSWORD: string;
    TEST_COURSE_SLUG: string;
}