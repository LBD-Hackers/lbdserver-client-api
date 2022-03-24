import { v4 } from "uuid";

const configuration = {
  projectId: v4(),
  stakeholders: [
    {
      webId: "http://localhost:5000/office1/profile/card#me",
      credentials: {
        refreshToken: "ZtXkvTXWBnfo8uIpz6gaBT6VpXz9gVDvMxx3_HT1pjB",
        clientId: "eLH_EAv8aArUzuve-DrRl",
        clientSecret:
          "qy8xZDtu0HtlpV1D4fUrw4eUk7MYOkcsRJTzL65kL8-NmahDxyJfDOM-4UcId6OSOFOZnHDvmpIFV5cPtREOuQ",
        oidcIssuer: "http://localhost:5000/",
      },
    },
    {
      webId: "http://localhost:5000/office2/profile/card#me",
      credentials: {
        refreshToken: "f2xPTgujQhmlBG4-R7PPiKt75_GsR-sccVz3eWHyX2o",
        clientId: "Pma4A0-pUN42BTmQoDoWu",
        clientSecret:
          "6lvvLPIFaLV_cV8nna0aDb09vGThPglBA52q-6PhawzKHzcx9f84HhiBYkm7BSaSpbX0-htI1qWj0ggZyTxNvg",
        oidcIssuer: "http://localhost:5000/",
      },
    },
  ],
};

export default configuration
