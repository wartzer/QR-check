export function User(name, role, email, password, classes, avatar) {
  this.name = name;
  this.role = role;
  this.email = email;
  this.password = password;
  this.classes = classes;
}
export function Schedule(checked_at, student, teacherEmail, id) {
  this.checked_at = checked_at;
  this.id = id;
  this.student = student;
  this.teacherEmail = teacherEmail;
}
