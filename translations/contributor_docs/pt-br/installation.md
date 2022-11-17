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
6. Instale o MongoDB e cheque se está rodando.
   * Para Mac OSX com [homebrew](http://brew.sh/): `brew tap mongodb/brew` e então `brew install mongodb-community` e finalmente comece o server com `brew services start mongodb-community` ou você pode visitar o guia de instalação aqui [Guia de Instalação para MacOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   * Para Windows e Linux: [Instalação do MongoDB](https://docs.mongodb.com/manual/installation/)
7. `$ cp .env.example .env`
8. (Opcional) Atualize o `.env` com as chaves necessárias para permitir certos comportamentos do app, i.e. adicionar GiHub ID e GitHub Secret se você quer conseguir entrar com o GitHub.
9. `$ npm run fetch-examples` - isso faz o download dos exemplos de esboço para um usuário chamado 'p5'
10. `$ npm start`
11. Navegue para [http://localhost:8000](http://localhost:8000) no seu browser
12. Intale o [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
13. Abra e fecha o Redux DevTools usando `ctrl+h`, e os mova usando `ctrl+w`

## Instalação com Docker

_Nota_: Os passos de instalação assumem que você está usando um shell baseado em Unix. Se você estiver usando Windows, você precisará usar `copy` no lugar de `cp`.

Usando Docker você pode ter um ambiente de desenvolvimento completo e consistente sem ter que instalar manualmente dependências como o Node, Mongo, etc. Ele também ajuda a isolar dependências e suas informações de outros projetos que você pode ter no mesmo computador que usa versões diferentes/conflitantes, etc.

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

## Configuração do S3 Bucket

Note que isso é opcioal, a menos que você esteja trabalhando na parte da aplicação que permite que o usuário faça o upload de imagens, vídeos, etc. Por favor consulte o [gist](https://gist.github.com/catarak/70c9301f0fd1ac2d6b58de03f61997e3) para configurar um S3 bucket para ser usado com esse projeto.

Se seu S3 bucket está na região Leste dos EUA (N Virginia) (us-east-1), você irá precisar configurar um URL customizada para isso, porque ele não segue o padrão de nomes do resto das regiões. Em vez disso, adicione o seguinte para seu arquivo
environment/.env :

`S3_BUCKET_URL_BASE=https://s3.amazonaws.com`

Se você configurou seu S3 bucket e DNS para usar um nome de domínio personalizado, você pode configura-lo usando essa variável. I.e.:

`S3_BUCKET_URL_BASE=https://files.mydomain.com`

Para mais informações sobre um domínio personalizado, veja essa documentação:

http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html#VirtualHostingCustomURLs
