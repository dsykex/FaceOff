import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

declare var faceapi;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  @ViewChild('webcam', {static: false}) cam: ElementRef;
  @ViewChild('canvas', {static: false}) canvas: ElementRef;
  @ViewChild('bg_webcam', {static: false}) bg_cam: ElementRef;
  @ViewChild('trademarks', {static: false}) trademarks: ElementRef;

  constructor()
  {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('./assets/models')
    ]).then(() => {
      this.startVideo();
    })
  }

  startVideo() {
    navigator.getUserMedia({ video: {} },
      stream => { this.cam.nativeElement.srcObject = stream; this.bg_cam.nativeElement.srcObject = stream; },
      err => console.log(err)
    )

    // All Video Manipulation Logic Goes Here!
    this.cam.nativeElement.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(this.cam.nativeElement);
      document.body.append(canvas);
      const displaySize = { width: this.cam.nativeElement.width, height: this.cam.nativeElement.height}
      faceapi.matchDimensions(canvas, displaySize);
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(this.cam.nativeElement, 
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        console.log(detections)

        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      },  100);
    })
  }

  ngOnInit(){

  }
}

