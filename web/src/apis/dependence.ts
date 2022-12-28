import axios from "axios";
interface KeyWord {
  q: String;
}

export async function DependencySearch(params: KeyWord | any): Promise<any> {
  if (params.q === "") {
    return Promise.resolve([]);
  } else {
    return axios.get(`https://registry.npmjs.org/-/v1/search`, {
      params: {
        text: params.q,
        size: 4,
      },
    });
  }
}

export async function GetDependencyVersions(params: KeyWord | any): Promise<any> {
  if (params.q === "") {
    return Promise.resolve([]);
  } else {
    return axios.get(`https://registry.npmjs.org/${params.q}`);
  }
}
