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
    "id": "div_div-05",
    "name": "Barishal",
    "districts": [
      {
        "id": "dist_dis-25",
        "name": "Barguna",
        "areas": [
          {
            "id": "area_t_tha-0354",
            "name": "Amtali"
          },
          {
            "id": "area_t_tha-0357",
            "name": "Bamna"
          },
          {
            "id": "area_t_tha-0355",
            "name": "Barguna Sadar"
          },
          {
            "id": "area_t_tha-0356",
            "name": "Betagi"
          },
          {
            "id": "area_t_tha-0358",
            "name": "Patharghata"
          },
          {
            "id": "area_t_tha-0359",
            "name": "Taltoli"
          }
        ]
      },
      {
        "id": "dist_dis-26",
        "name": "Barishal",
        "areas": [
          {
            "id": "area_t_tha-0343",
            "name": "Agailjhara"
          },
          {
            "id": "area_t_tha-0615",
            "name": "Airport"
          },
          {
            "id": "area_t_tha-0339",
            "name": "Babuganj"
          },
          {
            "id": "area_t_tha-0338",
            "name": "Bakerganj"
          },
          {
            "id": "area_t_tha-0341",
            "name": "Banaripara"
          },
          {
            "id": "area_t_tha-0617",
            "name": "Bandara"
          },
          {
            "id": "area_t_tha-0621",
            "name": "Barial"
          },
          {
            "id": "area_t_tha-0337",
            "name": "Barishal Sadar"
          },
          {
            "id": "area_t_tha-0619",
            "name": "Char Aila Kathi"
          },
          {
            "id": "area_t_tha-0342",
            "name": "Gournadi"
          },
          {
            "id": "area_t_tha-0346",
            "name": "Hijla"
          },
          {
            "id": "area_t_tha-0616",
            "name": "Kashipur"
          },
          {
            "id": "area_t_tha-0614",
            "name": "Kotwali"
          },
          {
            "id": "area_t_tha-0344",
            "name": "Mehendiganj"
          },
          {
            "id": "area_t_tha-0345",
            "name": "Muladi"
          },
          {
            "id": "area_t_tha-0618",
            "name": "Rupatali"
          },
          {
            "id": "area_t_tha-0620",
            "name": "Sadar"
          },
          {
            "id": "area_t_tha-0340",
            "name": "Uzirpur"
          }
        ]
      },
      {
        "id": "dist_dis-27",
        "name": "Bhola",
        "areas": [
          {
            "id": "area_t_tha-0347",
            "name": "Bhola Sadar"
          },
          {
            "id": "area_t_tha-0348",
            "name": "Borhanuddin"
          },
          {
            "id": "area_t_tha-0349",
            "name": "Char Fasson"
          },
          {
            "id": "area_t_tha-0350",
            "name": "Daulatkhan"
          },
          {
            "id": "area_t_tha-0353",
            "name": "Lalmohan"
          },
          {
            "id": "area_t_tha-0351",
            "name": "Monpura"
          },
          {
            "id": "area_t_tha-0352",
            "name": "Tazumuddin"
          }
        ]
      },
      {
        "id": "dist_dis-28",
        "name": "Jhalokathi",
        "areas": [
          {
            "id": "area_t_tha-0318",
            "name": "Jhalokathi Sadar"
          },
          {
            "id": "area_t_tha-0319",
            "name": "Kathalia"
          },
          {
            "id": "area_t_tha-0320",
            "name": "Nalchity"
          },
          {
            "id": "area_t_tha-0321",
            "name": "Rajapur"
          }
        ]
      },
      {
        "id": "dist_dis-29",
        "name": "Patuakhali",
        "areas": [
          {
            "id": "area_t_tha-0322",
            "name": "Bauphal"
          },
          {
            "id": "area_t_tha-0325",
            "name": "Dashmina"
          },
          {
            "id": "area_t_tha-0324",
            "name": "Dumki"
          },
          {
            "id": "area_t_tha-0328",
            "name": "Galachipa"
          },
          {
            "id": "area_t_tha-0326",
            "name": "Kalapara"
          },
          {
            "id": "area_t_tha-0327",
            "name": "Mirzaganj"
          },
          {
            "id": "area_t_tha-0323",
            "name": "Patuakhali Sadar"
          },
          {
            "id": "area_t_tha-0329",
            "name": "Rangabali"
          }
        ]
      },
      {
        "id": "dist_dis-30",
        "name": "Pirojpur",
        "areas": [
          {
            "id": "area_t_tha-0333",
            "name": "Bhandaria"
          },
          {
            "id": "area_t_tha-0336",
            "name": "Indurkani"
          },
          {
            "id": "area_t_tha-0332",
            "name": "Kaukhali"
          },
          {
            "id": "area_t_tha-0334",
            "name": "Mathbaria"
          },
          {
            "id": "area_t_tha-0331",
            "name": "Nazirpur"
          },
          {
            "id": "area_t_tha-0335",
            "name": "Nesarabad"
          },
          {
            "id": "area_t_tha-0330",
            "name": "Pirojpur Sadar"
          }
        ]
      }
    ]
  },
  {
    "id": "div_div-02",
    "name": "Chattogram",
    "districts": [
      {
        "id": "dist_dis-14",
        "name": "Bandarban",
        "areas": [
          {
            "id": "area_t_tha-0186",
            "name": "Ali Kadam"
          },
          {
            "id": "area_t_tha-0185",
            "name": "Bandarban Sadar"
          },
          {
            "id": "area_t_tha-0189",
            "name": "Lama"
          },
          {
            "id": "area_t_tha-0187",
            "name": "Naikhongchhari"
          },
          {
            "id": "area_t_tha-0188",
            "name": "Rowangchhari"
          },
          {
            "id": "area_t_tha-0190",
            "name": "Ruma"
          },
          {
            "id": "area_t_tha-0191",
            "name": "Thanchi"
          }
        ]
      },
      {
        "id": "dist_dis-15",
        "name": "Brahmanbaria",
        "areas": [
          {
            "id": "area_t_tha-0117",
            "name": "Akhaura"
          },
          {
            "id": "area_t_tha-0116",
            "name": "Ashuganj"
          },
          {
            "id": "area_t_tha-0119",
            "name": "Bancharampur"
          },
          {
            "id": "area_t_tha-0120",
            "name": "Bijoynagar"
          },
          {
            "id": "area_t_tha-0112",
            "name": "Brahmanbaria Sadar"
          },
          {
            "id": "area_t_tha-0113",
            "name": "Kasba"
          },
          {
            "id": "area_t_tha-0118",
            "name": "Nabinagar"
          },
          {
            "id": "area_t_tha-0114",
            "name": "Nasirnagar"
          },
          {
            "id": "area_t_tha-0115",
            "name": "Sarail"
          }
        ]
      },
      {
        "id": "dist_dis-16",
        "name": "Chandpur",
        "areas": [
          {
            "id": "area_t_tha-0143",
            "name": "Chandpur Sadar"
          },
          {
            "id": "area_t_tha-0147",
            "name": "Faridganj"
          },
          {
            "id": "area_t_tha-0140",
            "name": "Haimchar"
          },
          {
            "id": "area_t_tha-0145",
            "name": "Hajiganj"
          },
          {
            "id": "area_t_tha-0141",
            "name": "Kachua"
          },
          {
            "id": "area_t_tha-0146",
            "name": "Matlab Dakkhin"
          },
          {
            "id": "area_t_tha-0144",
            "name": "Matlab Uttar"
          },
          {
            "id": "area_t_tha-0498",
            "name": "Shahrasti"
          }
        ]
      },
      {
        "id": "dist_dis-17",
        "name": "Chattogram",
        "areas": [
          {
            "id": "area_t_tha-0580",
            "name": "Akbarshah"
          },
          {
            "id": "area_t_tha-0504",
            "name": "Anwara"
          },
          {
            "id": "area_t_tha-0581",
            "name": "Bakalia"
          },
          {
            "id": "area_t_tha-0582",
            "name": "Bandar"
          },
          {
            "id": "area_t_tha-0505",
            "name": "Banshkhali"
          },
          {
            "id": "area_t_tha-0583",
            "name": "Bayazid"
          },
          {
            "id": "area_t_tha-0506",
            "name": "Boalkhali"
          },
          {
            "id": "area_t_tha-0507",
            "name": "Chandanaish"
          },
          {
            "id": "area_t_tha-0584",
            "name": "Chandgaon"
          },
          {
            "id": "area_t_tha-0585",
            "name": "Chawkbazar"
          },
          {
            "id": "area_t_tha-0586",
            "name": "Double Mooring"
          },
          {
            "id": "area_t_tha-0587",
            "name": "EPZ"
          },
          {
            "id": "area_t_tha-0508",
            "name": "Fatikchhari"
          },
          {
            "id": "area_t_tha-0588",
            "name": "Halishahar"
          },
          {
            "id": "area_t_tha-0502",
            "name": "Hathazari"
          },
          {
            "id": "area_t_tha-0589",
            "name": "Karnaphuli"
          },
          {
            "id": "area_t_tha-0590",
            "name": "Khulshi"
          },
          {
            "id": "area_t_tha-0591",
            "name": "Kotwali"
          },
          {
            "id": "area_t_tha-0509",
            "name": "Lohagara"
          },
          {
            "id": "area_t_tha-0155",
            "name": "Mirsarai"
          },
          {
            "id": "area_t_tha-0510",
            "name": "Mirsharai"
          },
          {
            "id": "area_t_tha-0592",
            "name": "Pahartali"
          },
          {
            "id": "area_t_tha-0593",
            "name": "Panchlaish"
          },
          {
            "id": "area_t_tha-0594",
            "name": "Patenga"
          },
          {
            "id": "area_t_tha-0511",
            "name": "Patiya"
          },
          {
            "id": "area_t_tha-0512",
            "name": "Rangunia"
          },
          {
            "id": "area_t_tha-0513",
            "name": "Raozan"
          },
          {
            "id": "area_t_tha-0166",
            "name": "Rauzan"
          },
          {
            "id": "area_t_tha-0595",
            "name": "Sadarghat"
          },
          {
            "id": "area_t_tha-0503",
            "name": "Sandwip"
          },
          {
            "id": "area_t_tha-0515",
            "name": "Satkania"
          },
          {
            "id": "area_t_tha-0514",
            "name": "Sitakund"
          },
          {
            "id": "area_t_tha-0154",
            "name": "Sitakunda"
          }
        ]
      },
      {
        "id": "dist_dis-18",
        "name": "Cox's Bazar",
        "areas": [
          {
            "id": "area_t_tha-0169",
            "name": "Chakaria"
          },
          {
            "id": "area_t_tha-0168",
            "name": "Cox's Bazar Sadar"
          },
          {
            "id": "area_t_tha-0528",
            "name": "Eidgaon"
          },
          {
            "id": "area_t_tha-0170",
            "name": "Kutubdia"
          },
          {
            "id": "area_t_tha-0172",
            "name": "Maheshkhali"
          },
          {
            "id": "area_t_tha-0173",
            "name": "Pekua"
          },
          {
            "id": "area_t_tha-0174",
            "name": "Ramu"
          },
          {
            "id": "area_t_tha-0519",
            "name": "Teknaf"
          },
          {
            "id": "area_t_tha-0520",
            "name": "Ukhia"
          },
          {
            "id": "area_t_tha-0171",
            "name": "Ukhiya"
          }
        ]
      },
      {
        "id": "dist_dis-19",
        "name": "Cumilla",
        "areas": [
          {
            "id": "area_t_tha-0497",
            "name": "Bangrabazar"
          },
          {
            "id": "area_t_tha-0090",
            "name": "Barura"
          },
          {
            "id": "area_t_tha-0091",
            "name": "Brahmanpara"
          },
          {
            "id": "area_t_tha-0104",
            "name": "Burichong"
          },
          {
            "id": "area_t_tha-0092",
            "name": "Chandina"
          },
          {
            "id": "area_t_tha-0093",
            "name": "Chowddagram"
          },
          {
            "id": "area_t_tha-0496",
            "name": "Comilla Sadar South"
          },
          {
            "id": "area_t_tha-0099",
            "name": "Cumilla Sadar"
          },
          {
            "id": "area_t_tha-0094",
            "name": "Daudkandi"
          },
          {
            "id": "area_t_tha-0089",
            "name": "Debidwar"
          },
          {
            "id": "area_t_tha-0095",
            "name": "Homna"
          },
          {
            "id": "area_t_tha-0096",
            "name": "Laksam"
          },
          {
            "id": "area_t_tha-0105",
            "name": "Lalmai"
          },
          {
            "id": "area_t_tha-0100",
            "name": "Meghna"
          },
          {
            "id": "area_t_tha-0101",
            "name": "Monohorgonj"
          },
          {
            "id": "area_t_tha-0097",
            "name": "Muradnagar"
          },
          {
            "id": "area_t_tha-0098",
            "name": "Nangalkot"
          },
          {
            "id": "area_t_tha-0102",
            "name": "Sadar Dakshin"
          },
          {
            "id": "area_t_tha-0103",
            "name": "Titas"
          }
        ]
      },
      {
        "id": "dist_dis-20",
        "name": "Feni",
        "areas": [
          {
            "id": "area_t_tha-0106",
            "name": "Chhagalnaiya"
          },
          {
            "id": "area_t_tha-0111",
            "name": "Daganbhuiyan"
          },
          {
            "id": "area_t_tha-0107",
            "name": "Feni Sadar"
          },
          {
            "id": "area_t_tha-0110",
            "name": "Parshuram"
          },
          {
            "id": "area_t_tha-0109",
            "name": "Phulgazi"
          },
          {
            "id": "area_t_tha-0501",
            "name": "Sonagazi"
          }
        ]
      },
      {
        "id": "dist_dis-21",
        "name": "Khagrachhari",
        "areas": [
          {
            "id": "area_t_tha-0177",
            "name": "Dighinala"
          },
          {
            "id": "area_t_tha-0184",
            "name": "Guimara"
          },
          {
            "id": "area_t_tha-0176",
            "name": "Khagrachhari Sadar"
          },
          {
            "id": "area_t_tha-0179",
            "name": "Lakshichhari"
          },
          {
            "id": "area_t_tha-0180",
            "name": "Mahalchhari"
          },
          {
            "id": "area_t_tha-0181",
            "name": "Manikchhari"
          },
          {
            "id": "area_t_tha-0183",
            "name": "Matiranga"
          },
          {
            "id": "area_t_tha-0178",
            "name": "Panchhari"
          },
          {
            "id": "area_t_tha-0182",
            "name": "Ramgarh"
          }
        ]
      },
      {
        "id": "dist_dis-22",
        "name": "Lakshmipur",
        "areas": [
          {
            "id": "area_t_tha-0149",
            "name": "Kamalnagar"
          },
          {
            "id": "area_t_tha-0148",
            "name": "Lakshmipur Sadar"
          },
          {
            "id": "area_t_tha-0499",
            "name": "Raipur"
          },
          {
            "id": "area_t_tha-0152",
            "name": "Ramganj"
          },
          {
            "id": "area_t_tha-0151",
            "name": "Ramgati"
          }
        ]
      },
      {
        "id": "dist_dis-23",
        "name": "Noakhali",
        "areas": [
          {
            "id": "area_t_tha-0133",
            "name": "Begumganj"
          },
          {
            "id": "area_t_tha-0138",
            "name": "Chatkhil"
          },
          {
            "id": "area_t_tha-0132",
            "name": "Companiganj"
          },
          {
            "id": "area_t_tha-0134",
            "name": "Hatia"
          },
          {
            "id": "area_t_tha-0136",
            "name": "Kabirhat"
          },
          {
            "id": "area_t_tha-0131",
            "name": "Noakhali Sadar"
          },
          {
            "id": "area_t_tha-0137",
            "name": "Senbagh"
          },
          {
            "id": "area_t_tha-0139",
            "name": "Sonaimuri"
          },
          {
            "id": "area_t_tha-0500",
            "name": "Subarnachar"
          }
        ]
      },
      {
        "id": "dist_dis-24",
        "name": "Rangamati",
        "areas": [
          {
            "id": "area_t_tha-0124",
            "name": "Baghaichhari"
          },
          {
            "id": "area_t_tha-0125",
            "name": "Barkal"
          },
          {
            "id": "area_t_tha-0128",
            "name": "Bilaichhari"
          },
          {
            "id": "area_t_tha-0129",
            "name": "Juraichhari"
          },
          {
            "id": "area_t_tha-0122",
            "name": "Kaptai"
          },
          {
            "id": "area_t_tha-0123",
            "name": "Kaukhali"
          },
          {
            "id": "area_t_tha-0126",
            "name": "Langadu"
          },
          {
            "id": "area_t_tha-0130",
            "name": "Naniarchar"
          },
          {
            "id": "area_t_tha-0127",
            "name": "Rajasthali"
          },
          {
            "id": "area_t_tha-0121",
            "name": "Rangamati Sadar"
          }
        ]
      }
    ]
  },
  {
    "id": "div_div-01",
    "name": "Dhaka",
    "districts": [
      {
        "id": "dist_dis-01",
        "name": "Dhaka",
        "areas": [
          {
            "id": "area_t_tha-0530",
            "name": "Adabor"
          },
          {
            "id": "area_t_tha-0531",
            "name": "Airport"
          },
          {
            "id": "area_t_tha-0516",
            "name": "Ashulia"
          },
          {
            "id": "area_t_tha-0532",
            "name": "Badda"
          },
          {
            "id": "area_t_tha-0533",
            "name": "Banani"
          },
          {
            "id": "area_t_tha-0534",
            "name": "Bangshal"
          },
          {
            "id": "area_t_tha-0535",
            "name": "Bhashantek"
          },
          {
            "id": "area_t_tha-0536",
            "name": "Cantonment"
          },
          {
            "id": "area_t_tha-0537",
            "name": "Chawkbazar"
          },
          {
            "id": "area_t_tha-0538",
            "name": "Dakshin Khan"
          },
          {
            "id": "area_t_tha-0539",
            "name": "Darus-Salam"
          },
          {
            "id": "area_t_tha-0540",
            "name": "Demra"
          },
          {
            "id": "area_t_tha-0001",
            "name": "Dhamrai"
          },
          {
            "id": "area_t_tha-0541",
            "name": "Dhanmondi"
          },
          {
            "id": "area_t_tha-0002",
            "name": "Dohar"
          },
          {
            "id": "area_t_tha-0542",
            "name": "Gandaria"
          },
          {
            "id": "area_t_tha-0543",
            "name": "Gulshan"
          },
          {
            "id": "area_t_tha-0544",
            "name": "Hatirjheel"
          },
          {
            "id": "area_t_tha-0545",
            "name": "Hazaribagh"
          },
          {
            "id": "area_t_tha-0546",
            "name": "Jatrabari"
          },
          {
            "id": "area_t_tha-0547",
            "name": "Kadamtoli"
          },
          {
            "id": "area_t_tha-0548",
            "name": "Kafrul"
          },
          {
            "id": "area_t_tha-0549",
            "name": "Kalabagan"
          },
          {
            "id": "area_t_tha-0550",
            "name": "Kamrangirchar"
          },
          {
            "id": "area_t_tha-0003",
            "name": "Keraniganj"
          },
          {
            "id": "area_t_tha-0517",
            "name": "Keraniganj Model"
          },
          {
            "id": "area_t_tha-0551",
            "name": "Khilgaon"
          },
          {
            "id": "area_t_tha-0552",
            "name": "Khilkhet"
          },
          {
            "id": "area_t_tha-0553",
            "name": "Kotwali"
          },
          {
            "id": "area_t_tha-0554",
            "name": "Lalbagh"
          },
          {
            "id": "area_t_tha-0555",
            "name": "Mirpur Model"
          },
          {
            "id": "area_t_tha-0556",
            "name": "Mohammadpur"
          },
          {
            "id": "area_t_tha-0557",
            "name": "Motijheel"
          },
          {
            "id": "area_t_tha-0558",
            "name": "Mugda"
          },
          {
            "id": "area_t_tha-0004",
            "name": "Nawabganj"
          },
          {
            "id": "area_t_tha-0559",
            "name": "New Market"
          },
          {
            "id": "area_t_tha-0560",
            "name": "Pallabi"
          },
          {
            "id": "area_t_tha-0561",
            "name": "Paltan Model"
          },
          {
            "id": "area_t_tha-0562",
            "name": "Ramna Model"
          },
          {
            "id": "area_t_tha-0563",
            "name": "Rampura"
          },
          {
            "id": "area_t_tha-0564",
            "name": "Rupnagar"
          },
          {
            "id": "area_t_tha-0565",
            "name": "Sabujbagh"
          },
          {
            "id": "area_t_tha-0005",
            "name": "Savar"
          },
          {
            "id": "area_t_tha-0566",
            "name": "Shah Ali"
          },
          {
            "id": "area_t_tha-0567",
            "name": "Shahbagh"
          },
          {
            "id": "area_t_tha-0568",
            "name": "Shahjahanpur"
          },
          {
            "id": "area_t_tha-0569",
            "name": "Sher-e-Bangla Nagar"
          },
          {
            "id": "area_t_tha-0570",
            "name": "Shyampur"
          },
          {
            "id": "area_t_tha-0571",
            "name": "Sutrapur"
          },
          {
            "id": "area_t_tha-0572",
            "name": "Tejgaon"
          },
          {
            "id": "area_t_tha-0573",
            "name": "Tejgaon Industrial"
          },
          {
            "id": "area_t_tha-0574",
            "name": "Turag"
          },
          {
            "id": "area_t_tha-0575",
            "name": "Uttar Khan"
          },
          {
            "id": "area_t_tha-0576",
            "name": "Uttara East"
          },
          {
            "id": "area_t_tha-0577",
            "name": "Uttara West"
          },
          {
            "id": "area_t_tha-0578",
            "name": "Vatara"
          },
          {
            "id": "area_t_tha-0579",
            "name": "Wari"
          }
        ]
      },
      {
        "id": "dist_dis-02",
        "name": "Faridpur",
        "areas": [
          {
            "id": "area_t_tha-0011",
            "name": "Alfadanga"
          },
          {
            "id": "area_t_tha-0017",
            "name": "Bhanga"
          },
          {
            "id": "area_t_tha-0012",
            "name": "Boalmari"
          },
          {
            "id": "area_t_tha-0013",
            "name": "Charbhadrasan"
          },
          {
            "id": "area_t_tha-0014",
            "name": "Faridpur Sadar"
          },
          {
            "id": "area_t_tha-0015",
            "name": "Madhukhali"
          },
          {
            "id": "area_t_tha-0016",
            "name": "Nagarkanda"
          },
          {
            "id": "area_t_tha-0018",
            "name": "Sadarpur"
          },
          {
            "id": "area_t_tha-0019",
            "name": "Saltha"
          }
        ]
      },
      {
        "id": "dist_dis-03",
        "name": "Gazipur",
        "areas": [
          {
            "id": "area_t_tha-0625",
            "name": "Bason"
          },
          {
            "id": "area_t_tha-0626",
            "name": "Gacha"
          },
          {
            "id": "area_t_tha-0006",
            "name": "Gazipur Sadar"
          },
          {
            "id": "area_t_tha-0622",
            "name": "Joydebpur"
          },
          {
            "id": "area_t_tha-0524",
            "name": "Kaliakair"
          },
          {
            "id": "area_t_tha-0527",
            "name": "Kaliganj"
          },
          {
            "id": "area_t_tha-0525",
            "name": "Kapasia"
          },
          {
            "id": "area_t_tha-0627",
            "name": "Kashimpur"
          },
          {
            "id": "area_t_tha-0628",
            "name": "Konabari"
          },
          {
            "id": "area_t_tha-0629",
            "name": "Pubail"
          },
          {
            "id": "area_t_tha-0526",
            "name": "Sreepur"
          },
          {
            "id": "area_t_tha-0623",
            "name": "Tongi East"
          },
          {
            "id": "area_t_tha-0624",
            "name": "Tongi West"
          }
        ]
      },
      {
        "id": "dist_dis-04",
        "name": "Gopalganj",
        "areas": [
          {
            "id": "area_t_tha-0020",
            "name": "Gopalganj Sadar"
          },
          {
            "id": "area_t_tha-0021",
            "name": "Kashiani"
          },
          {
            "id": "area_t_tha-0024",
            "name": "Kotalipara"
          },
          {
            "id": "area_t_tha-0022",
            "name": "Muksudpur"
          },
          {
            "id": "area_t_tha-0023",
            "name": "Tungipara"
          }
        ]
      },
      {
        "id": "dist_dis-05",
        "name": "Kishoreganj",
        "areas": [
          {
            "id": "area_t_tha-0086",
            "name": "Astagram"
          },
          {
            "id": "area_t_tha-0085",
            "name": "Bajitpur"
          },
          {
            "id": "area_t_tha-0080",
            "name": "Hossainpur"
          },
          {
            "id": "area_t_tha-0076",
            "name": "Itna"
          },
          {
            "id": "area_t_tha-0084",
            "name": "Karimganj"
          },
          {
            "id": "area_t_tha-0077",
            "name": "Katiadi"
          },
          {
            "id": "area_t_tha-0083",
            "name": "Kishoreganj Sadar"
          },
          {
            "id": "area_t_tha-0082",
            "name": "Kuliarchar"
          },
          {
            "id": "area_t_tha-0087",
            "name": "Mithamain"
          },
          {
            "id": "area_t_tha-0088",
            "name": "Nikli"
          },
          {
            "id": "area_t_tha-0081",
            "name": "Pakundia"
          },
          {
            "id": "area_t_tha-0079",
            "name": "Tarail"
          },
          {
            "id": "area_t_tha-0078",
            "name": "Vairab"
          }
        ]
      },
      {
        "id": "dist_dis-06",
        "name": "Madaripur",
        "areas": [
          {
            "id": "area_t_tha-0029",
            "name": "Dasar"
          },
          {
            "id": "area_t_tha-0027",
            "name": "Kalkini"
          },
          {
            "id": "area_t_tha-0025",
            "name": "Madaripur Sadar"
          },
          {
            "id": "area_t_tha-0028",
            "name": "Rajoir"
          },
          {
            "id": "area_t_tha-0026",
            "name": "Shibchar"
          }
        ]
      },
      {
        "id": "dist_dis-07",
        "name": "Manikganj",
        "areas": [
          {
            "id": "area_t_tha-0035",
            "name": "Daulatpur"
          },
          {
            "id": "area_t_tha-0033",
            "name": "Ghior"
          },
          {
            "id": "area_t_tha-0030",
            "name": "Harirampur"
          },
          {
            "id": "area_t_tha-0032",
            "name": "Manikganj Sadar"
          },
          {
            "id": "area_t_tha-0031",
            "name": "Saturia"
          },
          {
            "id": "area_t_tha-0034",
            "name": "Shivalaya"
          },
          {
            "id": "area_t_tha-0036",
            "name": "Singair"
          }
        ]
      },
      {
        "id": "dist_dis-08",
        "name": "Munshiganj",
        "areas": [
          {
            "id": "area_t_tha-0041",
            "name": "Gazaria"
          },
          {
            "id": "area_t_tha-0040",
            "name": "Lohajang"
          },
          {
            "id": "area_t_tha-0037",
            "name": "Munshiganj Sadar"
          },
          {
            "id": "area_t_tha-0039",
            "name": "Sirajdikhan"
          },
          {
            "id": "area_t_tha-0038",
            "name": "Sreenagar"
          },
          {
            "id": "area_t_tha-0042",
            "name": "Tongibari"
          }
        ]
      },
      {
        "id": "dist_dis-09",
        "name": "Narayanganj",
        "areas": [
          {
            "id": "area_t_tha-0522",
            "name": "Araihazar"
          },
          {
            "id": "area_t_tha-0529",
            "name": "Bandar"
          },
          {
            "id": "area_t_tha-0637",
            "name": "Fatullah"
          },
          {
            "id": "area_t_tha-0636",
            "name": "Narayanganj Sadar"
          },
          {
            "id": "area_t_tha-0521",
            "name": "Rupganj"
          },
          {
            "id": "area_t_tha-0523",
            "name": "Sonargaon"
          }
        ]
      },
      {
        "id": "dist_dis-10",
        "name": "Narsingdi",
        "areas": [
          {
            "id": "area_t_tha-0047",
            "name": "Belabo"
          },
          {
            "id": "area_t_tha-0048",
            "name": "Monohardi"
          },
          {
            "id": "area_t_tha-0049",
            "name": "Narsingdi Sadar"
          },
          {
            "id": "area_t_tha-0518",
            "name": "Palash"
          },
          {
            "id": "area_t_tha-0051",
            "name": "Raipura"
          },
          {
            "id": "area_t_tha-0052",
            "name": "Shibpur"
          }
        ]
      },
      {
        "id": "dist_dis-11",
        "name": "Rajbari",
        "areas": [
          {
            "id": "area_t_tha-0056",
            "name": "Baliakandi"
          },
          {
            "id": "area_t_tha-0054",
            "name": "Goalanda"
          },
          {
            "id": "area_t_tha-0057",
            "name": "Kalukhali"
          },
          {
            "id": "area_t_tha-0055",
            "name": "Pangsha"
          },
          {
            "id": "area_t_tha-0053",
            "name": "Rajbari Sadar"
          }
        ]
      },
      {
        "id": "dist_dis-12",
        "name": "Shariatpur",
        "areas": [
          {
            "id": "area_t_tha-0062",
            "name": "Bhedarganj"
          },
          {
            "id": "area_t_tha-0063",
            "name": "Damudya"
          },
          {
            "id": "area_t_tha-0061",
            "name": "Gosairhat"
          },
          {
            "id": "area_t_tha-0059",
            "name": "Naria"
          },
          {
            "id": "area_t_tha-0058",
            "name": "Shariatpur Sadar"
          },
          {
            "id": "area_t_tha-0060",
            "name": "Zajira"
          }
        ]
      },
      {
        "id": "dist_dis-13",
        "name": "Tangail",
        "areas": [
          {
            "id": "area_t_tha-0064",
            "name": "Basail"
          },
          {
            "id": "area_t_tha-0065",
            "name": "Bhuapur"
          },
          {
            "id": "area_t_tha-0066",
            "name": "Delduar"
          },
          {
            "id": "area_t_tha-0075",
            "name": "Dhanbari"
          },
          {
            "id": "area_t_tha-0067",
            "name": "Ghatail"
          },
          {
            "id": "area_t_tha-0068",
            "name": "Gopalpur"
          },
          {
            "id": "area_t_tha-0074",
            "name": "Kalihati"
          },
          {
            "id": "area_t_tha-0069",
            "name": "Madhupur"
          },
          {
            "id": "area_t_tha-0070",
            "name": "Mirzapur"
          },
          {
            "id": "area_t_tha-0071",
            "name": "Nagarpur"
          },
          {
            "id": "area_t_tha-0072",
            "name": "Sakhipur"
          },
          {
            "id": "area_t_tha-0073",
            "name": "Tangail Sadar"
          }
        ]
      }
    ]
  },
  {
    "id": "div_div-04",
    "name": "Khulna",
    "districts": [
      {
        "id": "dist_dis-31",
        "name": "Bagerhat",
        "areas": [
          {
            "id": "area_t_tha-0304",
            "name": "Bagerhat Sadar"
          },
          {
            "id": "area_t_tha-0311",
            "name": "Chitalmari"
          },
          {
            "id": "area_t_tha-0303",
            "name": "Fakirhat"
          },
          {
            "id": "area_t_tha-0309",
            "name": "Kachua"
          },
          {
            "id": "area_t_tha-0305",
            "name": "Mollahat"
          },
          {
            "id": "area_t_tha-0310",
            "name": "Mongla"
          },
          {
            "id": "area_t_tha-0308",
            "name": "Morrelganj"
          },
          {
            "id": "area_t_tha-0307",
            "name": "Rampal"
          },
          {
            "id": "area_t_tha-0306",
            "name": "Sarankhola"
          }
        ]
      },
      {
        "id": "dist_dis-32",
        "name": "Chuadanga",
        "areas": [
          {
            "id": "area_t_tha-0281",
            "name": "Alamdanga"
          },
          {
            "id": "area_t_tha-0280",
            "name": "Chuadanga Sadar"
          },
          {
            "id": "area_t_tha-0282",
            "name": "Damurhuda"
          },
          {
            "id": "area_t_tha-0283",
            "name": "Jibannagar"
          }
        ]
      },
      {
        "id": "dist_dis-33",
        "name": "Jessore",
        "areas": [
          {
            "id": "area_t_tha-0260",
            "name": "Abhaynagar"
          },
          {
            "id": "area_t_tha-0261",
            "name": "Bagharpara"
          },
          {
            "id": "area_t_tha-0262",
            "name": "Chowgacha"
          },
          {
            "id": "area_t_tha-0265",
            "name": "Jessore Sadar"
          },
          {
            "id": "area_t_tha-0263",
            "name": "Jhikargacha"
          },
          {
            "id": "area_t_tha-0264",
            "name": "Keshabpur"
          },
          {
            "id": "area_t_tha-0259",
            "name": "Monirampur"
          },
          {
            "id": "area_t_tha-0266",
            "name": "Sharsha"
          }
        ]
      },
      {
        "id": "dist_dis-34",
        "name": "Jhenaidah",
        "areas": [
          {
            "id": "area_t_tha-0314",
            "name": "Harinakundu"
          },
          {
            "id": "area_t_tha-0312",
            "name": "Jhenaidah Sadar"
          },
          {
            "id": "area_t_tha-0315",
            "name": "Kaliganj"
          },
          {
            "id": "area_t_tha-0316",
            "name": "Kotchandpur"
          },
          {
            "id": "area_t_tha-0317",
            "name": "Moheshpur"
          },
          {
            "id": "area_t_tha-0313",
            "name": "Shailkupa"
          }
        ]
      },
      {
        "id": "dist_dis-35",
        "name": "Khulna",
        "areas": [
          {
            "id": "area_t_tha-0603",
            "name": "Aranghata"
          },
          {
            "id": "area_t_tha-0300",
            "name": "Batiaghata"
          },
          {
            "id": "area_t_tha-0301",
            "name": "Dacope"
          },
          {
            "id": "area_t_tha-0599",
            "name": "Daulatpur"
          },
          {
            "id": "area_t_tha-0296",
            "name": "Dighalia"
          },
          {
            "id": "area_t_tha-0299",
            "name": "Dumuria"
          },
          {
            "id": "area_t_tha-0602",
            "name": "Horintana"
          },
          {
            "id": "area_t_tha-0598",
            "name": "Khalishpur"
          },
          {
            "id": "area_t_tha-0600",
            "name": "Khan Jahan Ali"
          },
          {
            "id": "area_t_tha-0596",
            "name": "Kotwali"
          },
          {
            "id": "area_t_tha-0302",
            "name": "Koyra"
          },
          {
            "id": "area_t_tha-0601",
            "name": "Labanchara"
          },
          {
            "id": "area_t_tha-0294",
            "name": "Paikgachha"
          },
          {
            "id": "area_t_tha-0295",
            "name": "Phultala"
          },
          {
            "id": "area_t_tha-0297",
            "name": "Rupsa"
          },
          {
            "id": "area_t_tha-0597",
            "name": "Sonadanga"
          },
          {
            "id": "area_t_tha-0298",
            "name": "Terokhada"
          }
        ]
      },
      {
        "id": "dist_dis-36",
        "name": "Kushtia",
        "areas": [
          {
            "id": "area_t_tha-0289",
            "name": "Bheramara"
          },
          {
            "id": "area_t_tha-0288",
            "name": "Daulatpur"
          },
          {
            "id": "area_t_tha-0286",
            "name": "Khoksa"
          },
          {
            "id": "area_t_tha-0285",
            "name": "Kumarkhali"
          },
          {
            "id": "area_t_tha-0284",
            "name": "Kushtia Sadar"
          },
          {
            "id": "area_t_tha-0287",
            "name": "Mirpur"
          }
        ]
      },
      {
        "id": "dist_dis-37",
        "name": "Magura",
        "areas": [
          {
            "id": "area_t_tha-0292",
            "name": "Magura Sadar"
          },
          {
            "id": "area_t_tha-0293",
            "name": "Mohammadpur"
          },
          {
            "id": "area_t_tha-0290",
            "name": "Shalikha"
          },
          {
            "id": "area_t_tha-0291",
            "name": "Sreepur"
          }
        ]
      },
      {
        "id": "dist_dis-38",
        "name": "Meherpur",
        "areas": [
          {
            "id": "area_t_tha-0276",
            "name": "Gangni"
          },
          {
            "id": "area_t_tha-0275",
            "name": "Meherpur Sadar"
          },
          {
            "id": "area_t_tha-0274",
            "name": "Mujibnagar"
          }
        ]
      },
      {
        "id": "dist_dis-39",
        "name": "Narail",
        "areas": [
          {
            "id": "area_t_tha-0279",
            "name": "Kalia"
          },
          {
            "id": "area_t_tha-0278",
            "name": "Lohagara"
          },
          {
            "id": "area_t_tha-0277",
            "name": "Narail Sadar"
          }
        ]
      },
      {
        "id": "dist_dis-40",
        "name": "Satkhira",
        "areas": [
          {
            "id": "area_t_tha-0267",
            "name": "Assasuni"
          },
          {
            "id": "area_t_tha-0268",
            "name": "Debhata"
          },
          {
            "id": "area_t_tha-0269",
            "name": "Kalaroa"
          },
          {
            "id": "area_t_tha-0273",
            "name": "Kaliaganj"
          },
          {
            "id": "area_t_tha-0270",
            "name": "Satkhira Sadar"
          },
          {
            "id": "area_t_tha-0271",
            "name": "Shyamnagar"
          },
          {
            "id": "area_t_tha-0272",
            "name": "Tala"
          }
        ]
      }
    ]
  },
  {
    "id": "div_div-08",
    "name": "Mymensingh",
    "districts": [
      {
        "id": "dist_dis-61",
        "name": "Jamalpur",
        "areas": [
          {
            "id": "area_t_tha-0483",
            "name": "Bakshiganj"
          },
          {
            "id": "area_t_tha-0480",
            "name": "Dewanganj"
          },
          {
            "id": "area_t_tha-0479",
            "name": "Islampur"
          },
          {
            "id": "area_t_tha-0477",
            "name": "Jamalpur Sadar"
          },
          {
            "id": "area_t_tha-0482",
            "name": "Madariganj"
          },
          {
            "id": "area_t_tha-0478",
            "name": "Melandaha"
          },
          {
            "id": "area_t_tha-0481",
            "name": "Sarisabari"
          }
        ]
      },
      {
        "id": "dist_dis-62",
        "name": "Mymensingh",
        "areas": [
          {
            "id": "area_t_tha-0466",
            "name": "Bhaluka"
          },
          {
            "id": "area_t_tha-0469",
            "name": "Dhoubaura"
          },
          {
            "id": "area_t_tha-0464",
            "name": "Fulbaria"
          },
          {
            "id": "area_t_tha-0473",
            "name": "Gafargaon"
          },
          {
            "id": "area_t_tha-0472",
            "name": "Gouripur"
          },
          {
            "id": "area_t_tha-0471",
            "name": "Haluaghat"
          },
          {
            "id": "area_t_tha-0474",
            "name": "Ishwarganj"
          },
          {
            "id": "area_t_tha-0638",
            "name": "Kotwali"
          },
          {
            "id": "area_t_tha-0467",
            "name": "Muktagachha"
          },
          {
            "id": "area_t_tha-0468",
            "name": "Mymensingh Sadar"
          },
          {
            "id": "area_t_tha-0475",
            "name": "Nandail"
          },
          {
            "id": "area_t_tha-0470",
            "name": "Phulpur"
          },
          {
            "id": "area_t_tha-0639",
            "name": "Sadar"
          },
          {
            "id": "area_t_tha-0476",
            "name": "Tarakanda"
          },
          {
            "id": "area_t_tha-0465",
            "name": "Trishal"
          }
        ]
      },
      {
        "id": "dist_dis-63",
        "name": "Netrokona",
        "areas": [
          {
            "id": "area_t_tha-0487",
            "name": "Atpara"
          },
          {
            "id": "area_t_tha-0484",
            "name": "Barhatta"
          },
          {
            "id": "area_t_tha-0485",
            "name": "Durgapur"
          },
          {
            "id": "area_t_tha-0486",
            "name": "Kendua"
          },
          {
            "id": "area_t_tha-0489",
            "name": "Khaliajuri"
          },
          {
            "id": "area_t_tha-0490",
            "name": "Khalmakanda"
          },
          {
            "id": "area_t_tha-0488",
            "name": "Madan"
          },
          {
            "id": "area_t_tha-0491",
            "name": "Mohanganj"
          },
          {
            "id": "area_t_tha-0493",
            "name": "Netrokona Sadar"
          },
          {
            "id": "area_t_tha-0492",
            "name": "Purbadhala"
          }
        ]
      },
      {
        "id": "dist_dis-64",
        "name": "Sherpur",
        "areas": [
          {
            "id": "area_t_tha-0463",
            "name": "Jhenaigati"
          },
          {
            "id": "area_t_tha-0462",
            "name": "Nakla"
          },
          {
            "id": "area_t_tha-0460",
            "name": "Nalitabari"
          },
          {
            "id": "area_t_tha-0459",
            "name": "Sherpur Sadar"
          },
          {
            "id": "area_t_tha-0461",
            "name": "Sreebardi"
          }
        ]
      }
    ]
  },
  {
    "id": "div_div-03",
    "name": "Rajshahi",
    "districts": [
      {
        "id": "dist_dis-41",
        "name": "Bogra",
        "areas": [
          {
            "id": "area_t_tha-0215",
            "name": "Adamdighi"
          },
          {
            "id": "area_t_tha-0211",
            "name": "Bogra Sadar"
          },
          {
            "id": "area_t_tha-0218",
            "name": "Dhunat"
          },
          {
            "id": "area_t_tha-0214",
            "name": "Dupchanchia"
          },
          {
            "id": "area_t_tha-0219",
            "name": "Gabtali"
          },
          {
            "id": "area_t_tha-0210",
            "name": "Kahaloo"
          },
          {
            "id": "area_t_tha-0216",
            "name": "Nandigram"
          },
          {
            "id": "area_t_tha-0212",
            "name": "Sariakandi"
          },
          {
            "id": "area_t_tha-0213",
            "name": "Shajahanpur"
          },
          {
            "id": "area_t_tha-0220",
            "name": "Sherpur"
          },
          {
            "id": "area_t_tha-0221",
            "name": "Shibganj"
          },
          {
            "id": "area_t_tha-0217",
            "name": "Sonatala"
          }
        ]
      },
      {
        "id": "dist_dis-45",
        "name": "Chapai Nawabganj",
        "areas": [
          {
            "id": "area_t_tha-0246",
            "name": "Bholahat"
          },
          {
            "id": "area_t_tha-0243",
            "name": "Chapai Nawabganj Sadar"
          },
          {
            "id": "area_t_tha-0244",
            "name": "Gomastapur"
          },
          {
            "id": "area_t_tha-0245",
            "name": "Nachol"
          },
          {
            "id": "area_t_tha-0247",
            "name": "Shibganj"
          }
        ]
      },
      {
        "id": "dist_dis-42",
        "name": "Joypurhat",
        "areas": [
          {
            "id": "area_t_tha-0238",
            "name": "Akkelpur"
          },
          {
            "id": "area_t_tha-0242",
            "name": "Joypurhat Sadar"
          },
          {
            "id": "area_t_tha-0239",
            "name": "Kalai"
          },
          {
            "id": "area_t_tha-0240",
            "name": "Khetlal"
          },
          {
            "id": "area_t_tha-0241",
            "name": "Panchbibi"
          }
        ]
      },
      {
        "id": "dist_dis-43",
        "name": "Naogaon",
        "areas": [
          {
            "id": "area_t_tha-0254",
            "name": "Atrai"
          },
          {
            "id": "area_t_tha-0249",
            "name": "Badalgachi"
          },
          {
            "id": "area_t_tha-0251",
            "name": "Dhamoirhat"
          },
          {
            "id": "area_t_tha-0253",
            "name": "Manda"
          },
          {
            "id": "area_t_tha-0248",
            "name": "Mohadevpur"
          },
          {
            "id": "area_t_tha-0256",
            "name": "Naogaon Sadar"
          },
          {
            "id": "area_t_tha-0252",
            "name": "Niamatpur"
          },
          {
            "id": "area_t_tha-0250",
            "name": "Patnitala"
          },
          {
            "id": "area_t_tha-0257",
            "name": "Porsha"
          },
          {
            "id": "area_t_tha-0255",
            "name": "Raninagar"
          },
          {
            "id": "area_t_tha-0258",
            "name": "Sapahar"
          }
        ]
      },
      {
        "id": "dist_dis-44",
        "name": "Natore",
        "areas": [
          {
            "id": "area_t_tha-0234",
            "name": "Bagatipara"
          },
          {
            "id": "area_t_tha-0233",
            "name": "Baraigram"
          },
          {
            "id": "area_t_tha-0236",
            "name": "Gurudaspur"
          },
          {
            "id": "area_t_tha-0235",
            "name": "Lalpur"
          },
          {
            "id": "area_t_tha-0237",
            "name": "Naldanga"
          },
          {
            "id": "area_t_tha-0231",
            "name": "Natore Sadar"
          },
          {
            "id": "area_t_tha-0232",
            "name": "Singra"
          }
        ]
      },
      {
        "id": "dist_dis-46",
        "name": "Pabna",
        "areas": [
          {
            "id": "area_t_tha-0206",
            "name": "Atgharia"
          },
          {
            "id": "area_t_tha-0205",
            "name": "Bera"
          },
          {
            "id": "area_t_tha-0203",
            "name": "Bhangura"
          },
          {
            "id": "area_t_tha-0207",
            "name": "Chatmohor"
          },
          {
            "id": "area_t_tha-0209",
            "name": "Faridpur"
          },
          {
            "id": "area_t_tha-0202",
            "name": "Ishwardi"
          },
          {
            "id": "area_t_tha-0204",
            "name": "Pabna Sadar"
          },
          {
            "id": "area_t_tha-0208",
            "name": "Santhia"
          },
          {
            "id": "area_t_tha-0201",
            "name": "Sujanagar"
          }
        ]
      },
      {
        "id": "dist_dis-47",
        "name": "Rajshahi",
        "areas": [
          {
            "id": "area_t_tha-0227",
            "name": "Bagha"
          },
          {
            "id": "area_t_tha-0230",
            "name": "Bagmara"
          },
          {
            "id": "area_t_tha-0604",
            "name": "Boalia Model"
          },
          {
            "id": "area_t_tha-0225",
            "name": "Charghat"
          },
          {
            "id": "area_t_tha-0223",
            "name": "Durgapur"
          },
          {
            "id": "area_t_tha-0228",
            "name": "Godagari"
          },
          {
            "id": "area_t_tha-0224",
            "name": "Mohonpur"
          },
          {
            "id": "area_t_tha-0606",
            "name": "Motihar"
          },
          {
            "id": "area_t_tha-0222",
            "name": "Paba"
          },
          {
            "id": "area_t_tha-0226",
            "name": "Puthia"
          },
          {
            "id": "area_t_tha-0605",
            "name": "Rajpara"
          },
          {
            "id": "area_t_tha-0607",
            "name": "Shah Makhdum"
          },
          {
            "id": "area_t_tha-0229",
            "name": "Tanore"
          }
        ]
      },
      {
        "id": "dist_dis-48",
        "name": "Sirajganj",
        "areas": [
          {
            "id": "area_t_tha-0192",
            "name": "Belkuchi"
          },
          {
            "id": "area_t_tha-0193",
            "name": "Chauhali"
          },
          {
            "id": "area_t_tha-0194",
            "name": "Kamarbandha"
          },
          {
            "id": "area_t_tha-0195",
            "name": "Kazipur"
          },
          {
            "id": "area_t_tha-0196",
            "name": "Raiganj"
          },
          {
            "id": "area_t_tha-0197",
            "name": "Shahjadpur"
          },
          {
            "id": "area_t_tha-0198",
            "name": "Sirajganj Sadar"
          },
          {
            "id": "area_t_tha-0199",
            "name": "Tarash"
          },
          {
            "id": "area_t_tha-0200",
            "name": "Ullapara"
          }
        ]
      }
    ]
  },
  {
    "id": "div_div-07",
    "name": "Rangpur",
    "districts": [
      {
        "id": "dist_dis-49",
        "name": "Dinajpur",
        "areas": [
          {
            "id": "area_t_tha-0409",
            "name": "Birampur"
          },
          {
            "id": "area_t_tha-0407",
            "name": "Birganj"
          },
          {
            "id": "area_t_tha-0417",
            "name": "Birol"
          },
          {
            "id": "area_t_tha-0411",
            "name": "Bochaganj"
          },
          {
            "id": "area_t_tha-0418",
            "name": "Chirirbandar"
          },
          {
            "id": "area_t_tha-0414",
            "name": "Dinajpur Sadar"
          },
          {
            "id": "area_t_tha-0408",
            "name": "Ghoraghat"
          },
          {
            "id": "area_t_tha-0415",
            "name": "Hakimpur"
          },
          {
            "id": "area_t_tha-0412",
            "name": "Kaharol"
          },
          {
            "id": "area_t_tha-0416",
            "name": "Khansama"
          },
          {
            "id": "area_t_tha-0406",
            "name": "Nawabganj"
          },
          {
            "id": "area_t_tha-0410",
            "name": "Parbatipur"
          },
          {
            "id": "area_t_tha-0413",
            "name": "Phulbari"
          }
        ]
      },
      {
        "id": "dist_dis-50",
        "name": "Gaibandha",
        "areas": [
          {
            "id": "area_t_tha-0431",
            "name": "Gaibandha Sadar"
          },
          {
            "id": "area_t_tha-0434",
            "name": "Gobindaganj"
          },
          {
            "id": "area_t_tha-0436",
            "name": "Phulchhari"
          },
          {
            "id": "area_t_tha-0432",
            "name": "Polashbari"
          },
          {
            "id": "area_t_tha-0430",
            "name": "Sadullapur"
          },
          {
            "id": "area_t_tha-0433",
            "name": "Saghata"
          },
          {
            "id": "area_t_tha-0435",
            "name": "Sundarganj"
          }
        ]
      },
      {
        "id": "dist_dis-51",
        "name": "Kurigram",
        "areas": [
          {
            "id": "area_t_tha-0452",
            "name": "Bhurungamari"
          },
          {
            "id": "area_t_tha-0458",
            "name": "Char Rajibpur"
          },
          {
            "id": "area_t_tha-0456",
            "name": "Chilmari"
          },
          {
            "id": "area_t_tha-0450",
            "name": "Kurigram Sadar"
          },
          {
            "id": "area_t_tha-0451",
            "name": "Nageswari"
          },
          {
            "id": "area_t_tha-0453",
            "name": "Phulbari"
          },
          {
            "id": "area_t_tha-0454",
            "name": "Rajarhat"
          },
          {
            "id": "area_t_tha-0457",
            "name": "Roumari"
          },
          {
            "id": "area_t_tha-0455",
            "name": "Ulipur"
          }
        ]
      },
      {
        "id": "dist_dis-52",
        "name": "Lalmonirhat",
        "areas": [
          {
            "id": "area_t_tha-0423",
            "name": "Aditmari"
          },
          {
            "id": "area_t_tha-0421",
            "name": "Hatibandha"
          },
          {
            "id": "area_t_tha-0420",
            "name": "Kaliganj"
          },
          {
            "id": "area_t_tha-0419",
            "name": "Lalmonirhat Sadar"
          },
          {
            "id": "area_t_tha-0422",
            "name": "Patgram"
          }
        ]
      },
      {
        "id": "dist_dis-53",
        "name": "Nilphamari",
        "areas": [
          {
            "id": "area_t_tha-0426",
            "name": "Dimla"
          },
          {
            "id": "area_t_tha-0425",
            "name": "Domar"
          },
          {
            "id": "area_t_tha-0427",
            "name": "Jaldhaka"
          },
          {
            "id": "area_t_tha-0428",
            "name": "Kishoreganj"
          },
          {
            "id": "area_t_tha-0429",
            "name": "Nilphamari Sadar"
          },
          {
            "id": "area_t_tha-0424",
            "name": "Saidpur"
          }
        ]
      },
      {
        "id": "dist_dis-54",
        "name": "Panchagarh",
        "areas": [
          {
            "id": "area_t_tha-0404",
            "name": "Atwari"
          },
          {
            "id": "area_t_tha-0403",
            "name": "Boda"
          },
          {
            "id": "area_t_tha-0402",
            "name": "Debiganj"
          },
          {
            "id": "area_t_tha-0401",
            "name": "Panchagarh Sadar"
          },
          {
            "id": "area_t_tha-0405",
            "name": "Tetulia"
          }
        ]
      },
      {
        "id": "dist_dis-55",
        "name": "Rangpur",
        "areas": [
          {
            "id": "area_t_tha-0445",
            "name": "Badarganj"
          },
          {
            "id": "area_t_tha-0443",
            "name": "Gangachara"
          },
          {
            "id": "area_t_tha-0632",
            "name": "Haragach"
          },
          {
            "id": "area_t_tha-0448",
            "name": "Kaunia"
          },
          {
            "id": "area_t_tha-0630",
            "name": "Kotwali"
          },
          {
            "id": "area_t_tha-0633",
            "name": "Mahiganj"
          },
          {
            "id": "area_t_tha-0446",
            "name": "Mithapukur"
          },
          {
            "id": "area_t_tha-0634",
            "name": "Parshuram"
          },
          {
            "id": "area_t_tha-0449",
            "name": "Pirgacha"
          },
          {
            "id": "area_t_tha-0447",
            "name": "Pirganj"
          },
          {
            "id": "area_t_tha-0442",
            "name": "Rangpur Sadar"
          },
          {
            "id": "area_t_tha-0631",
            "name": "Tajhat"
          },
          {
            "id": "area_t_tha-0444",
            "name": "Taraganj"
          },
          {
            "id": "area_t_tha-0635",
            "name": "Tukuria"
          }
        ]
      },
      {
        "id": "dist_dis-56",
        "name": "Thakurgaon",
        "areas": [
          {
            "id": "area_t_tha-0441",
            "name": "Baliadangi"
          },
          {
            "id": "area_t_tha-0440",
            "name": "Haripur"
          },
          {
            "id": "area_t_tha-0438",
            "name": "Pirganj"
          },
          {
            "id": "area_t_tha-0439",
            "name": "Ranisankail"
          },
          {
            "id": "area_t_tha-0437",
            "name": "Thakurgaon Sadar"
          }
        ]
      }
    ]
  },
  {
    "id": "div_div-06",
    "name": "Sylhet",
    "districts": [
      {
        "id": "dist_dis-57",
        "name": "Habiganj",
        "areas": [
          {
            "id": "area_t_tha-0382",
            "name": "Azmiriganj"
          },
          {
            "id": "area_t_tha-0381",
            "name": "Bahubal"
          },
          {
            "id": "area_t_tha-0383",
            "name": "Baniachang"
          },
          {
            "id": "area_t_tha-0385",
            "name": "Chunarughat"
          },
          {
            "id": "area_t_tha-0386",
            "name": "Habiganj Sadar"
          },
          {
            "id": "area_t_tha-0384",
            "name": "Lakhai"
          },
          {
            "id": "area_t_tha-0387",
            "name": "Madhabpur"
          },
          {
            "id": "area_t_tha-0380",
            "name": "Nabiganj"
          },
          {
            "id": "area_t_tha-0388",
            "name": "Shaistaganj"
          }
        ]
      },
      {
        "id": "dist_dis-58",
        "name": "Moulvibazar",
        "areas": [
          {
            "id": "area_t_tha-0373",
            "name": "Bara Lekha"
          },
          {
            "id": "area_t_tha-0379",
            "name": "Juri"
          },
          {
            "id": "area_t_tha-0374",
            "name": "Kamalganj"
          },
          {
            "id": "area_t_tha-0375",
            "name": "Kulaura"
          },
          {
            "id": "area_t_tha-0376",
            "name": "Moulvibazar Sadar"
          },
          {
            "id": "area_t_tha-0377",
            "name": "Rajnagar"
          },
          {
            "id": "area_t_tha-0378",
            "name": "Sreemangal"
          }
        ]
      },
      {
        "id": "dist_dis-59",
        "name": "Sunamganj",
        "areas": [
          {
            "id": "area_t_tha-0391",
            "name": "Bishwambharpur"
          },
          {
            "id": "area_t_tha-0392",
            "name": "Chatak"
          },
          {
            "id": "area_t_tha-0394",
            "name": "Dewarabazar"
          },
          {
            "id": "area_t_tha-0396",
            "name": "Dharmapasha"
          },
          {
            "id": "area_t_tha-0399",
            "name": "Dirai"
          },
          {
            "id": "area_t_tha-0393",
            "name": "Jagannathpur"
          },
          {
            "id": "area_t_tha-0397",
            "name": "Jamalganj"
          },
          {
            "id": "area_t_tha-0400",
            "name": "Madhyanagar"
          },
          {
            "id": "area_t_tha-0398",
            "name": "Shalla"
          },
          {
            "id": "area_t_tha-0390",
            "name": "South Sunamganj"
          },
          {
            "id": "area_t_tha-0389",
            "name": "Sunamganj Sadar"
          },
          {
            "id": "area_t_tha-0395",
            "name": "Taherpur"
          }
        ]
      },
      {
        "id": "dist_dis-60",
        "name": "Sylhet",
        "areas": [
          {
            "id": "area_t_tha-0611",
            "name": "Airport"
          },
          {
            "id": "area_t_tha-0360",
            "name": "Balaganj"
          },
          {
            "id": "area_t_tha-0361",
            "name": "Beanibazar"
          },
          {
            "id": "area_t_tha-0362",
            "name": "Bishwanath"
          },
          {
            "id": "area_t_tha-0371",
            "name": "Dakshin Surma"
          },
          {
            "id": "area_t_tha-0364",
            "name": "Fenchuganj"
          },
          {
            "id": "area_t_tha-0365",
            "name": "Golapganj"
          },
          {
            "id": "area_t_tha-0366",
            "name": "Gowainghat"
          },
          {
            "id": "area_t_tha-0367",
            "name": "Jaintapur"
          },
          {
            "id": "area_t_tha-0610",
            "name": "Jalalabad"
          },
          {
            "id": "area_t_tha-0368",
            "name": "Kanaighat"
          },
          {
            "id": "area_t_tha-0363",
            "name": "Komponganj"
          },
          {
            "id": "area_t_tha-0608",
            "name": "Kotwali"
          },
          {
            "id": "area_t_tha-0612",
            "name": "Moglabazar"
          },
          {
            "id": "area_t_tha-0372",
            "name": "Osmani"
          },
          {
            "id": "area_t_tha-0613",
            "name": "Shah Paran"
          },
          {
            "id": "area_t_tha-0609",
            "name": "South Surma"
          },
          {
            "id": "area_t_tha-0369",
            "name": "Sylhet Sadar"
          },
          {
            "id": "area_t_tha-0370",
            "name": "Zakiganj"
          }
        ]
      }
    ]
  }
];
