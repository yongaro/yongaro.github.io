6 function draw_sub_image_cirble(){
  var canvas = document.getElementById("circlecanvas");
  var context = canvas.getContext("2d");
  context.arc(50, 50, 50, 0, Math.PI * 2, false);
  context.fillStyle = "red";
  context.fill();
  // <canvas id="circlecanvas" width="100" height="100"></canvas>
}
