column_1_container = document.getElementById("column_1_container");
column_2_container = document.getElementById("column_2_container");
column_3_container = document.getElementById("column_3_container");

text_html1 = "";
text_html2 = "";
text_html3 = "";

fetch("./assets/credits.json").then((response) => {
  response
    .json()
    .then((credits) => {
      // console.log(credits);
      credits.map((credit, index) => {
        // console.log(credit.name);
        if (index % 3 !== 0) return;

        if (credit.isVip === true) {
          color = "rgba(240, 83, 72, 1)";
        } else {
          color = "white";
        }

        text_html1 += `
            <div
            style="color: ${color}; margin: 18px; text-align: center"
            >
            ${credit.name}
            </div>
            `;

        // console.log(text_html);
      });

      credits.map((credit, index) => {
        // console.log(credit.name);
        if (index % 3 !== 1) return;

        if (credit.isVip === true) {
          color = "rgba(240, 83, 72, 1)";
        } else {
          color = "white";
        }

        text_html2 += `
            <div
            style="color: ${color}; margin: 18px; text-align: center"
            >
            ${credit.name}
            </div>
            `;

        // console.log(text_html);
      });

      credits.map((credit, index) => {
        // console.log(credit.name);
        if (index % 3 !== 2) return;

        if (credit.isVip === true) {
          color = "rgba(240, 83, 72, 1)";
        } else {
          color = "white";
        }

        text_html3 += `
            <div
            style="color: ${color}; margin: 18px; text-align: center"
            >
            ${credit.name}
            </div>
            `;

        // console.log(text_html);
      });
    })
    .then(() => {
      column_1_container.innerHTML = text_html1;
      column_2_container.innerHTML = text_html2;
      column_3_container.innerHTML = text_html3;
    });
});
