export interface Area {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  areas: Area[];
}

export interface Division {
  id: string;
  name: string;
  districts: District[];
}

export const bdLocations: Division[] = [
  {
    id: "div_dhaka",
    name: "Dhaka",
    districts: [
      {
        id: "dist_dhaka",
        name: "Dhaka",
        areas: [
          { id: "area_gulshan", name: "Gulshan" },
          { id: "area_banani", name: "Banani" },
          { id: "area_uttara", name: "Uttara" },
          { id: "area_mirpur", name: "Mirpur" },
          { id: "area_dhanmondi", name: "Dhanmondi" },
          { id: "area_motijheel", name: "Motijheel" },
          { id: "area_mohammadpur", name: "Mohammadpur" },
          { id: "area_badda", name: "Badda" },
        ]
      },
      {
        id: "dist_gazipur",
        name: "Gazipur",
        areas: [
          { id: "area_tongi", name: "Tongi" },
          { id: "area_joydebpur", name: "Joydebpur" },
          { id: "area_kaliakair", name: "Kaliakair" }
        ]
      },
      {
        id: "dist_narayanganj",
        name: "Narayanganj",
        areas: [
          { id: "area_narayanganjsadar", name: "Narayanganj Sadar" },
          { id: "area_sonargaon", name: "Sonargaon" },
          { id: "area_rupganj", name: "Rupganj" }
        ]
      }
    ]
  },
  {
    id: "div_chittagong",
    name: "Chittagong",
    districts: [
      {
        id: "dist_chittagong",
        name: "Chittagong",
        areas: [
          { id: "area_agrabad", name: "Agrabad" },
          { id: "area_halishahar", name: "Halishahar" },
          { id: "area_pahartali", name: "Pahartali" },
          { id: "area_kotwali", name: "Kotwali" }
        ]
      },
      {
        id: "dist_coxsbazar",
        name: "Cox's Bazar",
        areas: [
          { id: "area_coxsadar", name: "Cox's Bazar Sadar" },
          { id: "area_ramu", name: "Ramu" },
          { id: "area_chakaria", name: "Chakaria" },
          { id: "area_ukhiya", name: "Ukhiya" },
          { id: "area_teknaf", name: "Teknaf" }
        ]
      }
    ]
  },
  {
    id: "div_sylhet",
    name: "Sylhet",
    districts: [
      {
        id: "dist_sylhet",
        name: "Sylhet",
        areas: [
          { id: "area_sylhetsadar", name: "Sylhet Sadar" },
          { id: "area_zindabazar", name: "Zindabazar" },
          { id: "area_uposhohor", name: "Uposhohor" }
        ]
      }
    ]
  },
  {
    id: "div_rajshahi",
    name: "Rajshahi",
    districts: [
      {
        id: "dist_rajshahi",
        name: "Rajshahi",
        areas: [
          { id: "area_boalia", name: "Boalia" },
          { id: "area_rajpara", name: "Rajpara" },
          { id: "area_motihar", name: "Motihar" }
        ]
      }
    ]
  },
  {
    id: "div_khulna",
    name: "Khulna",
    districts: [
      {
        id: "dist_khulna",
        name: "Khulna",
        areas: [
          { id: "area_khulnasadar", name: "Khulna Sadar" },
          { id: "area_sonadanga", name: "Sonadanga" },
          { id: "area_khalishpur", name: "Khalishpur" }
        ]
      }
    ]
  }
];
