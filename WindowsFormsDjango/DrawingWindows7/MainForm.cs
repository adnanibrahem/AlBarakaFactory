using System;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Windows.Forms;

namespace DrawingWindows7
{
    public partial class MainForm : Form
    {
        string token;
        dynamic ordersList; // Fixed declaration of ordersList
        bool isLoading = true; // Flag to prevent multiple loads

        // Add this to InitializeComponent() or designer code to create the button
        private Button btnUploadFile;
        public MainForm(string token)
        {
            this.token = token;
            InitializeComponent();
        }

        private void MainForm_Load(object sender, EventArgs e)
        {
            btnRefresh_Click(null, null);

        }

        public dynamic GetOrdersFromServer()
        {
            var apiUrl = Program.apiUrl + "box/manufacturingOrder/list/";
            var request = (HttpWebRequest)WebRequest.Create(apiUrl);
            request.Method = "GET";
            request.Headers.Add("Authorization", $"JWT {token}");
            request.Accept = "application/json";
            ServicePointManager.ServerCertificateValidationCallback = (sender, cert, chain, sslPolicyErrors) => true; // Accept self-signed certs

            using (var response = (HttpWebResponse)request.GetResponse())
            using (var stream = response.GetResponseStream())
            using (var reader = new StreamReader(stream))
            {
                var json = reader.ReadToEnd();
                return Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(json);
            }
        }

        private void btnRefresh_Click(object sender, EventArgs e)
        {
            try
            {
                ordersList = GetOrdersFromServer();
                isLoading = true;
                listOrders.Items.Clear();

                foreach (var order in ordersList)
                {
                    listOrders.Items.Add(order.agentTitle);
                }
                isLoading = false;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error retrieving orders: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void listOrders_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (isLoading || listOrders.SelectedIndex < 0)
            {
                return; // Prevent action if loading or no selection
            }
            try
            {
                var selectedOrder = ordersList[listOrders.SelectedIndex];

                try
                {
                    labTitle.Text = "اسم العميل : " + selectedOrder.agentTitle;
                    labDateAt.Text = "تاريخ الطلب : " + selectedOrder.dateAt;
                    labComments.Text = "ملاحظات : " + selectedOrder.comments;
                    dgv.Rows.Clear();
                    if (selectedOrder.items != null || selectedOrder.items.Count > 0)
                    {
                        for (int i = 0; i < selectedOrder.items.Count; i++)
                        {
                            var item = selectedOrder.items[i];
                            dgv.Rows.Add(i + 1, item.title, item.length, item.width, item.thickness, item.quantity);
                        }
                    }

                    if (selectedOrder.images != null || selectedOrder.images.Count > 0)
                    {
                        string imageUrl = Program.apiUrl.Replace("/api/", "") + selectedOrder.images[0].image;
                        using (var webClient = new WebClient())
                        {
                            using (var stream = webClient.OpenRead(imageUrl))
                            {
                                drawingImg.Image = Image.FromStream(stream);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error displaying order details: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                //MessageBox.Show(orderDetails, "Order Details", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error displaying order details: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        // Add the following method to MainForm class
        string filePath = "";
        private void btnUploadFile_Click(object sender, EventArgs e)
        {
            if (listOrders.SelectedIndex < 0)
            {
                MessageBox.Show("اختر الطلب اولا.", "Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            using (OpenFileDialog openFileDialog = new OpenFileDialog())
            {
                if (openFileDialog.ShowDialog() == DialogResult.OK)
                {
                    filePath = openFileDialog.FileName;
                    label3.Text = "  " + Path.GetFileName(filePath);
                }
            }
        }

        private void UploadFileToServer(string filePath)
        {
            var selectedOrder = ordersList[listOrders.SelectedIndex];

            var apiUrl = Program.apiUrl + "box/manufacturingOrder/edit/" + selectedOrder.id+"/";
            using (var client = new HttpClient())
            using (var form = new MultipartFormDataContent())
            {
                client.DefaultRequestHeaders.Add("Authorization", $"JWT {token}");
                var fileContent = new ByteArrayContent(File.ReadAllBytes(filePath));
                fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
              
                form.Add(fileContent, "designFile", Path.GetFileName(filePath));
                form.Add(new StringContent(selectedOrder.id.ToString()), "id");
                form.Add(new StringContent(selectedOrder.agent.ToString()), "agent");
                form.Add(new StringContent(selectedOrder.comments?.ToString() ?? string.Empty), "comments");
                form.Add(new StringContent(selectedOrder.yearId.ToString()), "yearId");
                form.Add(new StringContent(selectedOrder.userAuth.ToString()), "userAuth");
                form.Add(new StringContent(selectedOrder.currency.ToString()), "currency");
                form.Add(new StringContent(selectedOrder.price.ToString()), "price");
                form.Add(new StringContent(selectedOrder.paths.ToString()), "paths");
                form.Add(new StringContent(selectedOrder.items.ToString()), "items");

                var response = client.PutAsync(apiUrl, form).Result;
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Server returned status code {response.StatusCode}");
                }
                else
                {
                    labTitle.Text = "";
                    labDateAt.Text = "";
                    labComments.Text = "";
                    label3.Text = "";
                    dgv.Rows.Clear();
                    drawingImg.Image = null;
                    btnRefresh_Click(null, null);
                }
            }
        }

        private void btnSaveData_Click(object sender, EventArgs e)
        {
            var confirmResult = MessageBox.Show(
                "هل أنت متأكد أنك تريد رفع الملف؟",
                "تأكيد الرفع",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question);

            if (confirmResult != DialogResult.Yes)
            {
                return;
            }

            try
            {
                UploadFileToServer(filePath);
                MessageBox.Show("File uploaded successfully.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error uploading file: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
