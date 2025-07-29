using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DrawingWindows7
{
    internal static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>

     //   public static string apiUrl = "http://127.0.0.1:8000/api/";// "https://10.121.7.14/api/";
        public static string apiUrl = "http://192.168.0.200/api/";
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            LoginForm loginForm = new LoginForm();
            loginForm.ShowDialog();
            if (string.IsNullOrEmpty(loginForm.token))
            {
                MessageBox.Show("Login failed. Application will exit.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            // Get user info from API
            try
            {
                var userInfo = GetUserInfo(loginForm.token)[0];
                // After retrieving userInfo, show the "privilege" property in a message box
                var privilege = userInfo.privilege != null ? userInfo.privilege.ToString() : "Unknown";
                //MessageBox.Show($"User privilege: {privilege}", "User Info", MessageBoxButtons.OK, MessageBoxIcon.Information);
                if (privilege == "drawing")
                {
                    Application.Run(new MainForm(loginForm.token));
                     
                }
                // You can use userInfo as needed here
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error retrieving user info: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            // If login and user info retrieval are successful, proceed to the main application form
           
        }

        private static dynamic GetUserInfo(string token)
        {
            using (var client = new System.Net.WebClient())
            {
                client.Headers.Add("Authorization", "JWT " + token);
                client.Headers.Add("Content-Type", "application/json");
                // Ignore SSL certificate errors (for self-signed certs)
                System.Net.ServicePointManager.ServerCertificateValidationCallback = (sender, cert, chain, sslPolicyErrors) => true;
                string url = apiUrl+ "users/info/";
                string response = System.Text.Encoding.UTF8.GetString(client.DownloadData(url));
                // You can replace dynamic with a strongly typed class if you have a user info model
                return Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(response);
            }
        }
    }
}
