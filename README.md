# <p align="center">편집가능 화이트보드</p>

<p align="center"><img src="https://github.com/ohddang/whiteboard/assets/68732996/aaca76a5-3c7a-46e0-b0a0-87d209f2b23d" width="500" /></p>


## 🔍 프로젝트 정보
* Typescript, css라이브러리, canvas활용, 최적화 학습을 목적으로 진행  
* 개발기간
  * 2024.1.6 ~ 2024.1.10(1주) / Canvas picking 구현
  * 2024.1.27 ~ 진행중 / CRA -> Vite Migration. git actions을 이용해 github pages로 배포  
<br/>

## 📖 주요기능
* 그림 도구를 선택한 뒤 그리기, 편집 등의 동작 수행  
* 그리기 도구 선택 후 mouseup 이벤트 발생 시 개별 canvas element를 생성
* 마우스 클릭으로 각각의 element를 picking하는 기능 구현  
<br/>

## 🔥 개발 중 겪었던 이슈
* Canvas 동적생성 시 이전 Canvas에 있는 이미지를 새 Canvas로 전달 방법
* 마지막에 그려야할 Picking Element가 제대로 업데이트 되지 않는 현상
* Canvas -> Canvas로 이미지 전달 시 영역이 비어있어도 Canvas의 사각형 영역이 뒤의 이미지를 가리는 현상
* CSS라이브러리 선택 시 tailwindcss를 사용하려 하였으나 랜덤으로 색상값을 생성하여 key값으로 사용해야해서 SASS로 변경
* useEffect에서 이벤트핸들러 등록했을때 선이 늘어날 수록 브라우저 속도가 현저히 느려지는 이슈
* 화이트보드 영역에서 마우스를 그냥 클릭하면(mousedown event, mouseup event)가 바로 실행되어 객체가 생기는 문제가 발생  
<br/>

## ✏ 기술스택
<img src="https://img.shields.io/badge/typescript-3178c6?style=for-the-badge&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/sass-cc6699?style=for-the-badge&logo=sass&logoColor=white"> <img src="https://img.shields.io/badge/react-black?style=for-the-badge&logo=react&logoColor=61DAFB"> <img src="https://img.shields.io/badge/vite-7f42c1?style=for-the-badge&logo=vite&logoColor=F7DF1E">  
<br/>

## 🎮 배포 주소
> [화이트보드 바로가기](https://ohddang.github.io/whiteboard/)  
<br/>

## 📝 Blog
>[블로그 바로가기](https://nth-challenge.tistory.com/category/React로%20화이트보드)  
<br/>

## ⛵ 이후 업데이트
