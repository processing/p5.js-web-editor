# Instalação para Desenvolvimento

Sigua essas instruções para configurar sem ambiente de desenvolvimento, que você precisa fazer antes de começar a contribuir para esse projeto.

## Instalação Manual

_Nota_: Os passos de instalação assumem que você está usando um shell baseado em Unix. Se você estiver usando Windows, você precisará usar `copy` no lugar de `cp`.

1. Instale o Node.js. A forma recomendada é pelo [nvm](https://github.com/nvm-sh/nvm). Você também pode instalar a versão 12.16.1 do [node.js](https://nodejs.org/download/release/v12.16.1/) diretamente do website do Node.js.
2. Faça um [Fork](https://help.github.com/articles/fork-a-repo) do [repositŕio do p5.js Web Editor](https://github.com/processing/p5.js-web-editor) para a sua conta do GitHub.
3. Faça um [Clone](https://help.github.com/articles/cloning-a-repository/) do seu novo forkdo repositório do GitHub no seu computador.

   ```
   $ git clone https://github.com/YOUR_USERNAME/p5.js-web-editor.git
   ```

4. Se você estiver usando nvm, rode `$ nvm use` para configurar sua versão do Node para 12.16.1
5. Navegue até a pasta do projeto e instale todas as suas dpendências necessárias com npm.

   ```
   $ cd p5.js-web-editor
   $ npm install
   ```
6. `$ cp .env.example .env`
7. (Opcional) Atualize o `.env` com as chaves necessárias para permitir certos comportamentos do app, i.e. adicionar GiHub ID e GitHub Secret se você quer conseguir entrar com o GitHub.
8. `$ npm run fetch-examples` - isso faz o download dos exemplos de esboço para um usuário chamado 'p5'
9. `$ npm start`
10. Navegue para [http://localhost:8000](http://localhost:8000) no seu browser
11. Intale o [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
12. Abra e fecha o Redux DevTools usando `ctrl+h`, e os mova usando `ctrl+w`

## Instalação com Docker

_Nota_: Os passos de instalação assumem que você está usando um shell baseado em Unix. Se você estiver usando Windows, você precisará usar `copy` no lugar de `cp`.

Usando Docker você pode ter um ambiente de desenvolvimento completo e consistente sem ter que instalar manualmente dependências como o Node, etc. Ele também ajuda a isolar dependências e suas informações de outros projetos que você pode ter no mesmo computador que usa versões diferentes/conflitantes, etc.

Note que isso usa um espaço significante da sua máquina. Cheque se você tem pelo menos 5GB disponíveis.

1. Instale o Docker no seu sistema operacional
   * Mac: https://www.docker.com/docker-mac
   * Windows: https://www.docker.com/docker-windows
2. Clone esse repositŕio e use `cd` para entrar nele
3. `$ docker-compose -f docker-compose-development.yml build`
4. `$ cp .env.example .env`
5. (Opcional) Atualize o `.env` com as chaves necessárias para permitir certos comportamentos do app, i.e. adicionar GiHub ID e GitHub Secret se você quer conseguir entrar com o GitHub.
6. `$ docker-compose -f docker-compose-development.yml run --rm app npm run fetch-examples`

Agora, em qualquer momento que você quiser iniciar o server com suas dependências você pode rodar:

7. `$ docker-compose -f docker-compose-development.yml up`
8. Navegue para [http://localhost:8000](http://localhost:8000) no seu browser

Para abrir um terminal/shell no server Docker que está rodando  (i.e. depois de ter rodado `docker-compose up`):

9. `$ docker-compose -f docker-compose-development.yml exec app bash -l`

Se você não tem todo o ambiente rodando, você pode rodar a instância de apenas um container (e deleta-lo automaticamente depois de ter o utilizado):

10.  `$ docker-compose -f docker-compose-development.yml run app --rm bash -l`
