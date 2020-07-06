const puppeteer = require('puppeteer');
const cursosDB = require('./db/Cursos');
const cadeirasDB = require('./db/Cadeiras');
const escolasDB = require('./db/Escolas');
//const database = firebase.database();






(async function main() {

    try {

        const browser4 = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page4 = await browser4.newPage();
        await page4.setViewport({ width: 800, height: 600 });
        console.log('-----------INICIO PROPINAS---------------------------------------');

        await page4.goto('https://autonoma.pt/tabela-de-propinas-2019-2020-2-2/');

        await page4.waitForSelector('div:nth-child(1)');
        const cursos3 = await page4.$$('div:nth-child(1) > div > div > div > div.wpb_text_column.wpb_content_element.vc_custom_1554482833013.tabela > div > table > tbody > tr:nth-child(3)');
        const curso3 = cursos3[0];


        const teste3 = await curso3.$('td:nth-child(2)');
        const teste3Name = await page4.evaluate(teste3 => teste3.innerText, teste3);
        const fix = parseFloat(teste3Name.replace("€", "").replace(",", "."))
        const addEscolas1 = await escolasDB.create({ nome: "Universidade Autónoma de Lisboa", propinas: fix });
        console.log(fix);



        /////////////////////////////////ISCTE///////////////////////////////////////////////////////////////////////////////


        await page4.goto('https://www.iscte-iul.pt/curso/27/mestrado-integrado-arquitetura');

        await page4.waitForSelector('div:nth-child(9)');
        const cursos1 = await page4.$$('div:nth-child(9) > div.col-md-3.col-xs-12.top-buffer-5 > div:nth-child(1)');
        const curso1 = cursos1[0];


        const teste1 = await curso1.$('b');
        const teste1Name = await page4.evaluate(teste1 => teste1.innerText, teste1);
        console.log(teste1Name);
        const addEscolas2 = await escolasDB.create({ nome: "ISCTE", propinas: teste1Name });


        ///////////////////////////////TECNICO/////////////////////////////////////////////////////////////////////////////////

        await page4.goto('https://guiaacademico.tecnico.ulisboa.pt/1o-e-2o-ciclos-e-ciclos-integrados/propinas/');

        await page4.waitForSelector('div.container_12');
        const curso2 = await page4.$$('div.container_12 > section.content_container.grid_12 > div.grid_9.alpha > article > div > table:nth-child(4) > tbody > tr:nth-child(1)');
        const cursos2 = curso2[0];

        const prop = await cursos2.$('td:nth-child(2)');
        const buttonName = await page4.evaluate(prop => prop.innerText, prop);
        console.log(buttonName);
        const fix2 = parseFloat(buttonName.replace("€", "").replace(",", "."))
        const addEscolas3 = await escolasDB.create({ nome: "Instituto Superior Técnico de Lisboa", propinas: fix2 });

        await browser4.close();
        console.log('-----------INICIO TECNICO--------------------------------------');

        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 });
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');



        await page.goto('https://tecnico.ulisboa.pt/pt/ensino/cursos/');
        await page.waitForSelector('.col-lg-6');
        const licenc = await page.$$('.col-lg-6 h1');
        // loop para escolher apenas Licenciaturas com e sem Mestrado Integrado, excluindo Mestrados e Doutoramentos.
        let p = 0;
        for (let k = 0; k < 2; k++) {
            await page.goto('https://tecnico.ulisboa.pt/pt/ensino/cursos/');
            await page.waitForSelector('.col-lg-6');
            const licenc = await page.$$('.col-lg-6 h1');
            const licen = licenc[k];
            const button3 = await licen.$('a'); // clicar nos cursos para podermos aceder às cadeiras.
            const button3Name = await page.evaluate(button3 => button3.innerText, button3);
            console.log('Licenc ', button3Name);
            (await button3).click();

            await page.waitForSelector('.table.table-courses.table-striped.clickable-row');
            const cursos = await page.$$('.table.table-courses.table-striped.clickable-row > tbody > tr');

            // loop pelos cursos todos.
            for (let i = 0; i < cursos.length; i++) {
                await page.waitForSelector('.table.table-courses.table-striped.clickable-row');
                const cursos = await page.$$('.table.table-courses.table-striped.clickable-row > tbody > tr');
                // clicar nos cursos para podermos aceder às cadeiras.
                const curso = cursos[i];
                const button = await curso.$('td');
                const buttonName = await page.evaluate(button => button.innerText, button);
                console.log('curso ', buttonName);
                const addCursos = await cursosDB.create({ nome: buttonName, escolasid: 1 });
                (await button).click();

                await page.waitForSelector('.col-lg-7.col-lg-push-5');
                const uni = await page.$$('.col-lg-7.col-lg-push-5');
                const uniC = uni[0];

                // clicar nas unidades curriculares 
                const button2 = await uniC.$('a');
                const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
                (await button2).click();

                const newPage = await newPagePromise;

                let pages = await browser.pages();
                await pages[pages.length - 1].waitForSelector('.col-sm-12');

                const cadeirasT = await pages[pages.length - 1].$$('.col-sm-12 > ul > li');
                // loop pelas cadeiras todas dentro do curso selecionado.
                for (let j = 0; j < cadeirasT.length; j++) {

                    try {
                        cadeira = cadeirasT[j];
                        const name = await cadeira.$eval('a', a => a.innerText);
                        console.log('name ', name);
                        const addCadeiras = await cadeirasDB.create({ nome: name, cursosid: p + 1 });
                    } catch {
                        console.log("Skipped.");
                    }
                }
                await pages[pages.length - 1].close();
                await page.goBack();
                p++;
            }
        }

        await browser.close();

        console.log('-------------------------Finished TECNICO---------------------------------');

        /////////////////////////////////////////////////////////////////////////////////////////////

        console.log('-----------INICIO ISCTE---------------------------------------');

        const browser2 = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

        const page2 = await browser2.newPage();
        await page2.setViewport({ width: 1920, height: 2160 });

        await page2.goto('https://www.iscte-iul.pt/estudar/licenciaturas/');
        await page2.waitForSelector('.courses-grid');
        const cursos = await page2.$$('.courses-grid > .row-wrapper > .col-wrapper > a > .item');


        for (let i = 0; i < cursos.length; i++) {


            await page2.goto('https://www.iscte-iul.pt/estudar/licenciaturas/');

            await page2.waitForSelector('.courses-grid');
            const cursos = await page2.$$('.courses-grid > .row-wrapper > .col-wrapper > a > .item');
            const curso = cursos[i];

            const button = await curso.$('.course');
            const buttonName = await page2.evaluate(button => button.innerText, button);
            console.log('curso ', buttonName);
            const addCursos = await cursosDB.create({ nome: buttonName, escolasid: 3 });



            (await button).click();

            await page2.waitForSelector('.section-menus-regular');
            const click = await page2.$$('.section-menus-regular > ul > li.section-menu-link');
            const clickT = click[1];
            const clicarBotao = await clickT.$('a');
            const clickbuttonName = await page2.evaluate(clicarBotao => clicarBotao.innerText, clicarBotao);
            (await clicarBotao).click();


            await page2.waitForSelector('.table');
            if (await page2.$('#hemera') !== null) {
                const cadeirasT = await page2.$$('div.content-courses > #hemera > div.table-responsive > .table > tbody > tr > td > span');
                for (let j = 0; j < cadeirasT.length; j++) {

                    try {
                        cadeira = cadeirasT[j];
                        const name = await cadeira.$eval('a', a => a.innerText);
                        console.log('name ', name);
                        const addCadeiras = await cadeirasDB.create({ nome: name, cursosid: p + 1 });
                        
                        //await fs.appendFile('out.csv', `"${buttonName}","${name}"\n`);
                    } catch {

                    }

                }

            } else {
                const cadeirassT = await page2.$$('.table > tbody > tr > td > span');
                for (let g = 0; g < cadeirassT.length; g++) {

                    try {
                        cadeiras = cadeirassT[g];
                        const names = await cadeiras.$eval('a', a => a.innerText);
                        console.log('name ', names);
                        const addCadeiras2 = await cadeirasDB.create({ nome: names, cursosid: p + 1 });
                        //await fs.appendFile('out.csv', `"${buttonName}","${name}"\n`);
                    } catch {

                    }

                }

            }
            p++
        }

        await browser2.close();
        console.log('-------------------------Finished ISCTE---------------------------------');

        // /////////////////////////////////////////////////////////////////////////////////////////////


        console.log('-----------INICIO UAL---------------------------------------');

        const browser3 = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

        const page3 = await browser3.newPage();
        await page3.setViewport({ width: 800, height: 600 });
        await page3.goto('https://autonoma.pt/cursos/');
        await page3.waitForSelector('.col-md-8.textoRight');
        const cursos8 = await page3.$$('.col-md-8.textoRight');

        //fs.writeFile('out.csv', 'curso,cadeira\n');
        // loop pelos cursos todos.
        for (let i = 0; i < cursos8.length; i++) {

            await page3.goto('https://autonoma.pt/cursos/');
            await page3.waitForSelector('.col-md-8.textoRight');
            const cursos8 = await page3.$$('.col-md-8.textoRight');

            const curso8 = cursos8[i];

            try {
                const teste = await curso8.$('.unArtigos');
                const testeName = await page3.evaluate(teste => teste.innerText, teste);

                //Selecionar apenas os cursos para Licenciatura(incluindo Mestrado Integrado), excluindo Mestrados e Doutoramentos.
                if (testeName == 'Licenciatura') {
                    // clicar nos cursos para podermos aceder às cadeiras.
                    const button = await curso8.$('a');
                    const buttonName = await page3.evaluate(button => button.innerText, button);
                    console.log('curso ', buttonName);
                    const addCursos = await cursosDB.create({ nome: buttonName, escolasid: 2 });
                    (await button).click();
                } else {
                    continue;
                }
            } catch {
                continue;
            }

            await page3.waitForSelector('.panel-group');
            const cadeirasT3 = await page3.$$('.panel-group > .panel.panel-default > .panel-heading > .panel-title:not(.acordTitulo)');
            console.log(cadeirasT3.length);
            // loop pelas cadeiras todas dentro do curso selecionado.
            for (let j = 0; j < cadeirasT3.length; j++) {

                try {
                    cadeira = cadeirasT3[j];
                    const name = await cadeira.$eval('a', a => a.innerText);
                    console.log('name ', name);
                    const addCadeiras = await cadeirasDB.create({ nome: name, cursosid: p + 1 });

                    //await fs.appendFile('out.csv', `"${buttonName}","${name}"\n`);
                } catch {
                    console.log("Skipped.");
                }
            }
            p++
        }

        console.log('-------------------------Finished UAL---------------------------------');

        /////////////////////////////////////////////////////////////////////////////////////////////

        // console.log('-----------INICIO PROPINAS---------------------------------------');

        // await page3.goto('https://autonoma.pt/tabela-de-propinas-2019-2020-2-2/');

        // await page3.waitForSelector('div:nth-child(1)');
        // const cursos3 = await page3.$$('div:nth-child(1) > div > div > div > div.wpb_text_column.wpb_content_element.vc_custom_1554482833013.tabela > div > table > tbody > tr:nth-child(3)');
        // const curso3 = cursos3[0];


        // const teste3 = await curso3.$('td:nth-child(2)');
        // const teste3Name = await page3.evaluate(teste3 => teste3.innerText, teste3);
        // const fix = parseFloat(teste3Name.replace("€", "").replace(",", "."))
        // const addEscolas1 = await escolasDB.create({ nome: "Universidade Autónoma de Lisboa", propinas: fix });
        // console.log(fix);



        // /////////////////////////////////ISCTE///////////////////////////////////////////////////////////////////////////////


        // await page3.goto('https://www.iscte-iul.pt/curso/27/mestrado-integrado-arquitetura');

        // await page3.waitForSelector('div:nth-child(9)');
        // const cursos1 = await page3.$$('div:nth-child(9) > div.col-md-3.col-xs-12.top-buffer-5 > div:nth-child(1)');
        // const curso1 = cursos1[0];


        // const teste1 = await curso1.$('b');
        // const teste1Name = await page3.evaluate(teste1 => teste1.innerText, teste1);
        // console.log(teste1Name);
        // const addEscolas2 = await escolasDB.create({ nome: "ISCTE", propinas: teste1Name });


        // ///////////////////////////////TECNICO/////////////////////////////////////////////////////////////////////////////////

        // await page3.goto('https://guiaacademico.tecnico.ulisboa.pt/1o-e-2o-ciclos-e-ciclos-integrados/propinas/');

        // await page3.waitForSelector('div.container_12');
        // const curso2 = await page3.$$('div.container_12 > section.content_container.grid_12 > div.grid_9.alpha > article > div > table:nth-child(4) > tbody > tr:nth-child(1)');
        // const cursos2 = curso2[0];

        // const prop = await cursos2.$('td:nth-child(2)');
        // const buttonName = await page3.evaluate(prop => prop.innerText, prop);
        // console.log(buttonName);
        // const fix2 = parseFloat(buttonName.replace("€", "").replace(",", "."))
        // const addEscolas3 = await escolasDB.create({ nome: "Instituto Superior Técnico de Lisboa", propinas: fix2 });

        // await browser3.close();
        console.log('-------------------------Finished TUDO---------------------------------');

    } catch (e) {
        console.log('Our error', e);
    }
})();