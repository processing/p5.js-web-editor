# 설치

다음의 안내를 따라 본 프로젝트에 코드를 기여하기 위해 필요한 개발 환경을 설정해주십시오.

## 수동 설치

_주의_: 다음의 설치 단계들은 유닉스 계열의 쉘을 이용한다는 가정이 깔려 있습니다. 만약 윈도우를 사용하고 계신다면 `cp` 대신 `copy`를 사용해야 할 것입니다.

1. Node.js를 설치하십시오. [nvm](https://github.com/nvm-sh/nvm)을 통해 설치하는 걸 권장드립니다. 혹은 Node.js 웹사이트를 통해 [node.js](https://nodejs.org/download/release/v12.16.1/) 버전 12.16.1을 설치하는 것도 가능합니다.
2. [p5.js 웹 에디터 저장소](https://github.com/processing/p5.js-web-editor)를 여러분의 깃허브 계정에 [포크](https://help.github.com/articles/fork-a-repo)하십시오.
3. 포크한 깃허브 저장소를 여러분의 로컬 컴퓨터에 [클론](https://help.github.com/articles/cloning-a-repository/)하십시오.

   ```
   $ git clone https://github.com/YOUR_USERNAME/p5.js-web-editor.git
   ```

4. nvm을 사용하신다면, $ nvm use 를 실행해 Node 버전을 12.16.1로 설정하십시오.
5. 프로젝트 폴더로 가서 npm을 이용해 필요한 모든 디펜던시들을 설치하십시오.

   ```
   $ cd p5.js-web-editor
   $ npm install
   ```
6. `$ cp .env.example .env`
7. (선택사항) 깃허브에 로그인 하고 싶을 경우 깃헙 ID를 더하는 등 특정한 행동을 가능하게 하고 싶을 경우 .env에 필수 키를 업데이트 하십시오.
8. `$ npm run fetch-examples` - 이는 p5라 불리는 유저로 예시 스케치를 다운로드 합니다.
9. `$ npm start`
10. 브라우저에서 [http://localhost:8000](http://localhost:8000)에 접속하십시오.
11. [리액트 개발자 도구](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)를 설치하십시오. 
12. `ctrl+h`로 리덕스 개발자 툴 열기와 닫기를, 그리고 `ctrl+w`로 이동시키기를 하십시오.

## 도커 설치

_주의_: 다음의 설치 단계들은 유닉스 계열의 쉘을 이용한다는 가정이 깔려 있습니다. 만약 윈도우를 사용하고 계신다면 `cp` 대신 `copy`를 사용해야 할 것입니다.

도커를 이용하면 Node 등의 디펜던시들을 수동으로 설치할 필요 없이 완전하고 일관성 있는 개발 환경을 얻을 수 있게 됩니다. 또한 이는 같은 컴퓨터에서 다른 버전을 사용하는 다른 프로젝트로부터 디펜던시와 데이터를 분리시키는데에도 유용합니다.

다만 이는 여러분의 컴퓨터의 상당한 용량을 차지한다는 점을 주의하십시오. 최소한 5GB의 여유 공간을 확보해두시기 바랍니다.

1. 운영 체제에 도커를 설치하십시오.
   * 맥: https://www.docker.com/docker-mac
   * 윈도우: https://www.docker.com/docker-windows
2. 저장소를 클론하고 cd를 이용해 해당 저장소로 들어가십시오.
3. `$ docker-compose -f docker-compose-development.yml build`
4. `$ cp .env.example .env`
5. (선택사항) 깃허브에 로그인 하고 싶을 경우 깃헙 ID를 더하는 등 특정한 행동을 가능하게 하고 싶을 경우 .env에 필수 키를 업데이트 하십시오.
6. `$ docker-compose -f docker-compose-development.yml run --rm app npm run fetch-examples`

이제, 언제든지 디펜던시와 함께 서버를 시작시키기를 원할 때면 다음을 실행하시면 됩니다:

7. `$ docker-compose -f docker-compose-development.yml up`
8. 브라우저에서 [http://localhost:8000](http://localhost:8000)에 접속하십시오.

실행되고 있는 도커 서버에서 터미널/쉘 열기(즉, `docker-compose up`이 실행된 이후):

9. `$ docker-compose -f docker-compose-development.yml exec app bash -l`

완전한 서버 환경이 실행되고 있지 않은 경우, 일회용 컨테이너 인스턴스를 런칭하고 전부 사용한 후에는 자동으로 삭제되도록 할 수 있습니다:

10. `$ docker-compose -f docker-compose-development.yml run app --rm bash -l`
