using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DrawingWindows7
{
    public partial class LoginForm : Form
    {
        public LoginForm()
        {
            InitializeComponent();
        }
        public string token = string.Empty;
        private async void btnLogin_Click(object sender, EventArgs e)
        {
            string username = txbUsername.Text;
            string password = txbPassword.Text;
              token = await GetTokenAsync(username, password);
            if (!string.IsNullOrEmpty(token))
            {
                 Close();
            }
            else
            {
                MessageBox.Show("Login failed.", "Error");
                 Close();
            }
        }

        private async Task<string> GetTokenAsync(string username, string password)
        {
          
            using (var handler = new HttpClientHandler())
            {
                handler.ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true;
                using (var client = new HttpClient(handler))
                {
                    var values = new Dictionary<string, string>
                        {
                            { "username", username },
                            { "password", password }
                        };
                    var content = new FormUrlEncodedContent(values);
                    try
                    {
                        var response = await client.PostAsync(Program.apiUrl+ "auth/token/", content);
                        if (response.IsSuccessStatusCode)
                        {
                            var responseString = await response.Content.ReadAsStringAsync();
                            dynamic json = JsonConvert.DeserializeObject(responseString);
                            return json.token;
                        }
                    }
                    catch
                    {
                        // Handle exceptions as needed
                    }
                }
            }
            return null;
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }
    }
}
